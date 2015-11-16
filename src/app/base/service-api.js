/**
 * 业务接口服务层
 */
define(function(require) {
    require('angular');

    angular.module('apiService', ['ajaxService'])
        .factory('pm', ['$http', '$rootScope', 'CONFIG', 'Ajax', function($http, $rootScope, CONFIG, Ajax) {
            var pm = {};
            // IndexedDB implementations still use API prefixes
            var myIndexedDB = window.indexedDB || // Use the standard DB API
                window.mozIndexedDB || // Or Firefox's early version of it
                window.webkitIndexedDB; // Or Chrome's early version
            // Firefox does not prefix these two:
            var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
            var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
            var IDBCursor = window.IDBCursor || window.webkitIDBCursor;

            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }

            function guid() {
                return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
            }

            pm.DB = {
                onerror: function(event, callback) {
                    console.log(event);
                },

                open_v21: function() {
                    var request = myIndexedDB.open("postman", "POSTman request history");
                    request.onsuccess = function(e) {
                        var v = "0.6";
                        pm.DB.db = e.target.result;
                        var db = pm.DB.db;

                        //We can only create Object stores in a setVersion transaction
                        if (v !== db.version) {
                            var setVrequest = db.setVersion(v);

                            setVrequest.onfailure = function(e) {
                                console.log(e);
                            };

                            setVrequest.onsuccess = function(event) {
                                //Only create if does not already exist
                                if (!db.objectStoreNames.contains("requests")) {
                                    var requestStore = db.createObjectStore("requests", {
                                        keyPath: "id"
                                    });
                                    requestStore.createIndex("timestamp", "timestamp", {
                                        unique: false
                                    });
                                }

                                if (!db.objectStoreNames.contains("collections")) {
                                    var collectionsStore = db.createObjectStore("collections", {
                                        keyPath: "id"
                                    });
                                    collectionsStore.createIndex("timestamp", "timestamp", {
                                        unique: false
                                    });
                                }

                                if (!db.objectStoreNames.contains("collection_requests")) {
                                    var collectionRequestsStore = db.createObjectStore("collection_requests", {
                                        keyPath: "id"
                                    });
                                    collectionRequestsStore.createIndex("timestamp", "timestamp", {
                                        unique: false
                                    });
                                    collectionRequestsStore.createIndex("collectionId", "collectionId", {
                                        unique: false
                                    });
                                }

                                if (db.objectStoreNames.contains("collection_responses")) {
                                    db.deleteObjectStore("collection_responses");
                                }

                                if (!db.objectStoreNames.contains("environments")) {
                                    var environmentsStore = db.createObjectStore("environments", {
                                        keyPath: "id"
                                    });
                                    environmentsStore.createIndex("timestamp", "timestamp", {
                                        unique: false
                                    });
                                    environmentsStore.createIndex("id", "id", {
                                        unique: false
                                    });
                                }

                                if (!db.objectStoreNames.contains("header_presets")) {
                                    var requestStore = db.createObjectStore("header_presets", {
                                        keyPath: "id"
                                    });
                                    requestStore.createIndex("timestamp", "timestamp", {
                                        unique: false
                                    });
                                }

                                var transaction = event.target.result;
                                transaction.oncomplete = function() {
                                    pm.history.getAllRequests();
                                    pm.envManager.getAllEnvironments();
                                    pm.headerPresets.init();
                                };
                            };

                            setVrequest.onupgradeneeded = function(evt) {};
                        } else {
                            pm.history.getAllRequests();
                            pm.envManager.getAllEnvironments();
                            pm.headerPresets.init();
                        }

                    };

                    request.onfailure = pm.DB.onerror;
                },

                open_latest: function() {
                    var v = 11;
                    window.abc = new Date().getTime();
                    var request = myIndexedDB.open("postman", v);
                    request.onupgradeneeded = function(e) {
                        var db = e.target.result;
                        pm.DB.db = db;
                        if (!db.objectStoreNames.contains("requests")) {
                            var requestStore = db.createObjectStore("requests", {
                                keyPath: "id"
                            });
                            requestStore.createIndex("timestamp", "timestamp", {
                                unique: false
                            });
                        }

                        if (!db.objectStoreNames.contains("collections")) {
                            var collectionsStore = db.createObjectStore("collections", {
                                keyPath: "id"
                            });
                            collectionsStore.createIndex("timestamp", "timestamp", {
                                unique: false
                            });
                        }

                        if (!db.objectStoreNames.contains("collection_requests")) {
                            var collectionRequestsStore = db.createObjectStore("collection_requests", {
                                keyPath: "id"
                            });
                            collectionRequestsStore.createIndex("timestamp", "timestamp", {
                                unique: false
                            });
                            collectionRequestsStore.createIndex("collectionId", "collectionId", {
                                unique: false
                            });
                        }
                    };

                    request.onsuccess = function(e) {
                        console.log('db open ' + (new Date().getTime() - abc));
                        console.log('db.start:' + (new Date().getTime() - tick))
                        pm.DB.db = e.target.result;
                        // pm.history.getAllRequests();
                        // pm.envManager.getAllEnvironments();
                        // pm.headerPresets.init();
                    };

                    request.onerror = pm.DB.onerror;
                },

                open: function() {
                    var m = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
                    if (m && parseInt(m[2]) < 23) {
                        pm.DB.open_v21();
                    } else {
                        pm.DB.open_latest();
                    }
                },

                saveCollection: function(collection, callback) {
                    var db = pm.DB.db;
                    var trans = db.transaction(["collections"], "readwrite");
                    var store = trans.objectStore("collections");

                    var request;

                    if (collection.id) {
                        var boundKeyRange = IDBKeyRange.only(collection.id);
                    } else {
                        collection.id = guid();
                        collection.timestamp = new Date().getTime();
                    }
                    // request = store.put(collection);

                    // request.onsuccess = function() {
                    //     callback && callback(collection);
                    // };

                    // request.onerror = function(e) {
                    //     console.log(e.value);
                    // };

                    Ajax.post({
                        url: CONFIG.HOST_API + CONFIG.API_COLLECTION_SAVE,
                        data: collection
                    }, function(response) {
                        callback && callback(collection);
                    })
                },

                saveCollectionRequest: function(req, callback) {
                    var db = pm.DB.db;
                    // var trans = db.transaction(["collection_requests"], "readwrite");
                    // var store = trans.objectStore("collection_requests");

                    if (req.id) {
                        var boundKeyRange = IDBKeyRange.only(req.id);
                    } else {
                        req.id = guid();
                        req.timestamp = new Date().getTime();
                    }

                    // var collectionRequest = store.put(req);

                    // collectionRequest.onsuccess = function() {
                    //     callback && callback(req);
                    // };

                    // collectionRequest.onerror = function(e) {
                    //     console.log(e.value);
                    // };

                    Ajax.post({
                        url: CONFIG.HOST_API + CONFIG.API_REQUEST_SAVE,
                        data: req
                    }, function(response) {
                        callback && callback(req);
                    })
                },

                getCollection: function(id, callback) {
                    var db = pm.DB.db;
                    // var trans = db.transaction(["collections"], "readwrite");
                    // var store = trans.objectStore("collections");

                    //Get everything in the store
                    if (!id) {
                        callback && callback(new Collection());
                    } else {
                        // var cursorRequest = store.get(id);

                        // cursorRequest.onsuccess = function(e) {
                        //     var result = e.target.result;
                        //     callback && callback(new Collection(result));
                        // };
                        // cursorRequest.onerror = pm.DB.onerror;

                        Ajax.get({
                            url: CONFIG.HOST_API + CONFIG.API_COLLECTION_QUERY,
                            data: {
                                id: id
                            }
                        }, function(response) {
                            callback && callback(new Collection(response.body));
                        })
                    }
                },

                getCollections: function(callback) {
                    console.log('getCollections:' + (new Date().getTime() - tick))
                    var db = pm.DB.db;

                    // var trans = db.transaction(["collections"], "readwrite");
                    // var store = trans.objectStore("collections");

                    // //Get everything in the store
                    // var keyRange = IDBKeyRange.lowerBound(0);
                    // var cursorRequest = store.openCursor(keyRange);
                    // var numCollections = 0;
                    // var items = [];
                    // cursorRequest.onsuccess = function(e) {
                    //     var result = e.target.result;
                    //     if (!result) {
                    //         callback && callback(items);
                    //         return;
                    //     }

                    //     var collection = new Collection(result.value);
                    //     numCollections++;

                    //     items.push(collection);

                    //     result['continue']();
                    // };

                    // cursorRequest.onerror = function(e) {
                    //     console.log(e);
                    // };

                    Ajax.get({
                        url: CONFIG.HOST_API + CONFIG.API_COLLECTION_LIST
                    }, function(response) {
                        var items = [];
                        for (var i in response.body) {
                            var collection = new Collection(response.body[i]);
                            items.push(collection);
                        }
                        callback && callback(items);
                    })
                },

                getAllRequestsInCollection: function(collection, callback) {
                    var db = pm.DB.db;

                    Ajax.get({
                        url: CONFIG.HOST_API + CONFIG.API_REQUEST_LIST,
                        data: {
                        	collectionId: collection.collectionId
                        }
                    }, function(response) {
                        var items = [];
                        for (var i in response.body) {
                            var request = new CollectionRequest(response.body[i]);
                            items.push(request);
                        }
                        callback && callback(items);
                    })

                    // var trans = db.transaction(["collection_requests"], "readwrite");

                    // //Get everything in the store
                    // var keyRange = IDBKeyRange.lowerBound(0);
                    // if (collection.collectionId) {
                    //     keyRange = IDBKeyRange.only(collection.collectionId);
                    // }
                    // var store = trans.objectStore("collection_requests");

                    // var index = store.index("collectionId");
                    // var cursorRequest = index.openCursor(keyRange);

                    // var requests = [];

                    // cursorRequest.onsuccess = function(e) {
                    //     var result = e.target.result;

                    //     if (!result) {
                    //         callback && callback(requests);
                    //         return;
                    //     }

                    //     var request = result.value;
                    //     requests.push(new CollectionRequest(request));

                    //     //This wil call onsuccess again and again until no more request is left
                    //     result['continue']();
                    // };
                    // cursorRequest.onerror = pm.DB.onerror;
                },

                addRequest: function(historyRequest, callback) {
                    var db = pm.DB.db;
                    var trans = db.transaction(["requests"], "readwrite");
                    var store = trans.objectStore("requests");
                    var request = store.put(historyRequest);

                    request.onsuccess = function(e) {
                        callback && callback(historyRequest);
                    };

                    request.onerror = function(e) {
                        console.log(e.value);
                    };
                },

                getRequest: function(id, callback) {
                    var db = pm.DB.db;
                    var trans = db.transaction(["requests"], "readwrite");
                    var store = trans.objectStore("requests");

                    //Get everything in the store
                    var cursorRequest = store.get(id);

                    cursorRequest.onsuccess = function(e) {
                        var result = e.target.result;
                        if (!result) {
                            return;
                        }

                        callback && callback(result);
                    };
                    cursorRequest.onerror = pm.DB.onerror;
                },

                getCollectionRequest: function(id, callback) {
                    var db = pm.DB.db;
                    // var trans = db.transaction(["collection_requests"], "readwrite");
                    // var store = trans.objectStore("collection_requests");

                    //Get everything in the store
                    if (!id) {
                        callback && callback(new CollectionRequest());
                    } else {
                        // var cursorRequest = store.get(id);

                        // cursorRequest.onsuccess = function(e) {
                        //     var result = e.target.result;
                        //     if (!result) {
                        //         return;
                        //     }

                        //     callback && callback(new CollectionRequest(result));
                        //     return result;
                        // };
                        // cursorRequest.onerror = pm.DB.onerror;

                        Ajax.get({
                            url: CONFIG.HOST_API + CONFIG.API_REQUEST_QUERY,
                            data: {
                                id: id
                            }
                        }, function(response) {
                            callback && callback(new CollectionRequest(response.body));
                        })
                    }
                },


                getAllRequestItems: function(callback) {
                    var db = pm.DB.db;
                    if (db == null) {
                        return;
                    }

                    var trans = db.transaction(["requests"], "readwrite");
                    var store = trans.objectStore("requests");

                    //Get everything in the store
                    var keyRange = IDBKeyRange.lowerBound(0);
                    var index = store.index("timestamp");
                    var cursorRequest = index.openCursor(keyRange);
                    var historyRequests = [];

                    cursorRequest.onsuccess = function(e) {
                        var result = e.target.result;

                        if (!result) {
                            callback && callback(historyRequests);
                            return;
                        }

                        var request = result.value;
                        historyRequests.push(request);

                        //This wil call onsuccess again and again until no more request is left
                        result['continue']();
                    };

                    cursorRequest.onerror = pm.DB.onerror;
                },

                deleteRequest: function(id, callback) {
                    // try {
                    //     var db = pm.DB.db;
                    //     var trans = db.transaction(["requests"], "readwrite");
                    //     var store = trans.objectStore(["requests"]);

                    //     var request = store['delete'](id);

                    //     request.onsuccess = function() {
                    //         callback && callback(id);
                    //     };

                    //     request.onerror = function(e) {
                    //         console.log(e);
                    //     };
                    // } catch (e) {
                    //     console.log(e);
                    // }
                    Ajax.post({
                        url: CONFIG.HOST_API + CONFIG.API_COLLECTION_REMOVE,
                        data: {
                            id: id
                        }
                    }, function(response) {
                        callback && callback(id);
                    })
                },

                deleteHistory: function(callback) {
                    var db = pm.DB.db;
                    var clearTransaction = db.transaction(["requests"], "readwrite");
                    var clearRequest = clearTransaction.objectStore(["requests"]).clear();
                    clearRequest.onsuccess = function(event) {
                        callback && callback();
                    };
                },

                deleteCollectionRequest: function(id, callback) {
                    // var db = pm.DB.db;
                    // var trans = db.transaction(["collection_requests"], "readwrite");
                    // var store = trans.objectStore(["collection_requests"]);

                    // var request = store['delete'](id);

                    // request.onsuccess = function(e) {
                    //     callback && callback(id);
                    // };

                    // request.onerror = function(e) {
                    //     console.log(e);
                    // };
                    Ajax.post({
                        url: CONFIG.HOST_API + CONFIG.API_REQUEST_REMOVE,
                        data: {
                            id: id
                        }
                    }, function(response) {
                        callback && callback(id);
                    })

                },

                deleteAllCollectionRequests: function(id) {
                    var db = pm.DB.db;
                    var trans = db.transaction(["collection_requests"], "readwrite");

                    //Get everything in the store
                    var keyRange = IDBKeyRange.only(id);
                    var store = trans.objectStore("collection_requests");

                    var index = store.index("collectionId");
                    var cursorRequest = index.openCursor(keyRange);

                    cursorRequest.onsuccess = function(e) {
                        var result = e.target.result;

                        if (!result) {
                            return;
                        }

                        var request = result.value;
                        pm.DB.deleteCollectionRequest(request.id);
                        result['continue']();
                    };
                    cursorRequest.onerror = pm.DB.onerror;
                },

                deleteCollection: function(id, callback) {
                    // var db = pm.DB.db;
                    // var trans = db.transaction(["collections"], "readwrite");
                    // var store = trans.objectStore(["collections"]);

                    // var request = store['delete'](id);

                    // request.onsuccess = function() {
                    //     pm.DB.deleteAllCollectionRequests(id);
                    //     callback && callback(id);
                    // };

                    // request.onerror = function(e) {
                    //     console.log(e);
                    // };

                    Ajax.post({
                        url: CONFIG.HOST_API + CONFIG.API_COLLECTION_REMOVE,
                        data: {
                            id: id
                        }
                    }, function(response) {
                        pm.DB.deleteAllCollectionRequests(id);
                        callback && callback(id);
                    })
                }
            };

            pm.init = function() {
                pm.DB.open();
            };

            pm.ajax = Ajax;
            pm.DB.open();
            console.log(pm.DB.db);

            return pm;
        }]);
})
