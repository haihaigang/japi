define(function(require, exports, module) {

    var Collection = require('../../model/collection'),
        CollectionRequest = require('../../model/collection-request');

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    function guid() {
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    function LocalApi(data) {
        this.DB = undefined;

        this.init(data);
    }

    LocalApi.prototype.init = function(data) {
        this.pm = { DB: {} };
        // IndexedDB implementations still use API prefixes
        this.myIndexedDB = window.indexedDB || // Use the standard DB API
            window.mozIndexedDB || // Or Firefox's early version of it
            window.webkitIndexedDB; // Or Chrome's early version
        // Firefox does not prefix these two:
        this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
        this.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
        this.IDBCursor = window.IDBCursor || window.webkitIDBCursor;

        this.open();
    }

    LocalApi.prototype.onerror = function(event, callback) {
        console.log(event);
    };

    LocalApi.prototype.open_v21 = function() {
        var request = this.myIndexedDB.open("postman", "POSTman request history");
        request.onsuccess = function(e) {
            var v = "0.6";
            this.pm.DB.db = e.target.result;
            var db = this.pm.DB.db;

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
                        this.pm.history.getAllRequests();
                        this.pm.envManager.getAllEnvironments();
                        this.pm.headerPresets.init();
                    };
                };

                setVrequest.onupgradeneeded = function(evt) {};
            } else {
                this.pm.history.getAllRequests();
                this.pm.envManager.getAllEnvironments();
                this.pm.headerPresets.init();
            }
        };

        request.onfailure = this.onerror;
    };

    LocalApi.prototype.open_latest = function() {
        var v = 11;
        var that = this;
        window.abc = new Date().getTime();
        var request = this.myIndexedDB.open("postman", v);
        request.onupgradeneeded = function(e) {
            var db = e.target.result;
            that.pm.DB.db = db;
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
            that.pm.DB.db = e.target.result;
            // this.pm.history.getAllRequests();
            // this.pm.envManager.getAllEnvironments();
            // this.pm.headerPresets.init();
        };

        request.onerror = this.onerror;
    };

    LocalApi.prototype.open = function() {
        var a = 1
        var m = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
        if (m && parseInt(m[2]) < 23) {
            this.open_v21();
        } else {
            this.open_latest();
        }
    };

    LocalApi.prototype.saveCollection = function(collection, callback) {
        var db = this.pm.DB.db;
        var trans = db.transaction(["collections"], "readwrite");
        var store = trans.objectStore("collections");

        var request;

        if (collection.id) {
            var boundKeyRange = this.IDBKeyRange.only(collection.id);
        } else {
            collection.id = guid();
            collection.timestamp = new Date().getTime();
        }
        request = store.put(collection);

        request.onsuccess = function() {
            callback && callback(collection);
        };

        request.onerror = function(e) {
            console.log(e.value);
        };
    };

    LocalApi.prototype.saveCollectionRequest = function(req, callback) {
        var db = this.pm.DB.db;
        var trans = db.transaction(["collection_requests"], "readwrite");
        var store = trans.objectStore("collection_requests");

        if (req.id) {
            var boundKeyRange = this.IDBKeyRange.only(req.id);
        } else {
            req.id = guid();
            req.timestamp = new Date().getTime();
        }

        var collectionRequest = store.put(req);

        collectionRequest.onsuccess = function() {
            callback && callback(req);
        };

        collectionRequest.onerror = function(e) {
            console.log(e.value);
        };
    };

    LocalApi.prototype.getCollection = function(id, callback) {
        var db = this.pm.DB.db;
        var trans = db.transaction(["collections"], "readwrite");
        var store = trans.objectStore("collections");

        //Get everything in the store
        if (!id) {
            callback && callback(new Collection());
        } else {
            var cursorRequest = store.get(id);

            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                callback && callback(new Collection(result));
            };
            cursorRequest.onerror = this.onerror;
        }
    }

    LocalApi.prototype.getCollections = function(callback) {
        console.log('getCollections:' + (new Date().getTime() - tick))
        var db = this.pm.DB.db;

        var trans = db.transaction(["collections"], "readwrite");
        var store = trans.objectStore("collections");

        //Get everything in the store
        var keyRange = this.IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);
        var numCollections = 0;
        var items = [];
        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;
            if (!result) {
                console.log('getCollections end ' + (new Date().getTime() - tick))
                callback && callback(items);
                return;
            }

            var collection = new Collection(result.value);
            numCollections++;

            items.push(collection);

            result['continue']();
        };

        cursorRequest.onerror = function(e) {
            console.log(e);
        };
    };

    LocalApi.prototype.getAllRequestsInCollection = function(collection, callback) {
        var db = this.pm.DB.db;
        var trans = db.transaction(["collection_requests"], "readwrite");

        //Get everything in the store
        var keyRange = this.IDBKeyRange.lowerBound(0);
        if (collection.collectionId) {
            keyRange = this.IDBKeyRange.only(collection.collectionId);
        }
        var store = trans.objectStore("collection_requests");

        var index = store.index("collectionId","timestamp");
        var cursorRequest = index.openCursor(keyRange);

        var requests = [];

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;

            if (!result) {
                callback && callback(requests);
                return;
            }

            var request = result.value;
            requests.push(new CollectionRequest(request));

            //This wil call onsuccess again and again until no more request is left
            result['continue']();
        };
        cursorRequest.onerror = this.onerror;
    };

    LocalApi.prototype.addRequest = function(historyRequest, callback) {
        var db = this.pm.DB.db;
        var trans = db.transaction(["requests"], "readwrite");
        var store = trans.objectStore("requests");
        var request = store.put(historyRequest);

        request.onsuccess = function(e) {
            callback && callback(historyRequest);
        };

        request.onerror = function(e) {
            console.log(e.value);
        };
    };

    LocalApi.prototype.getRequest = function(id, callback) {
        var db = this.pm.DB.db;
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
        cursorRequest.onerror = this.onerror;
    };

    LocalApi.prototype.getCollectionRequest = function(id, callback) {
        var db = this.pm.DB.db;
        var trans = db.transaction(["collection_requests"], "readwrite");
        var store = trans.objectStore("collection_requests");

        //Get everything in the store
        if (!id) {
            callback && callback(new CollectionRequest());
        } else {
            var cursorRequest = store.get(id);

            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if (!result) {
                    return;
                }

                callback && callback(new CollectionRequest(result));
                return result;
            };
            cursorRequest.onerror = this.onerror;

        }
    };


    LocalApi.prototype.getAllRequestItems = function(callback) {
        var db = this.pm.DB.db;
        if (db == null) {
            return;
        }

        var trans = db.transaction(["requests"], "readwrite");
        var store = trans.objectStore("requests");

        //Get everything in the store
        var keyRange = this.IDBKeyRange.lowerBound(0);
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

        cursorRequest.onerror = this.onerror;
    };

    LocalApi.prototype.deleteRequest = function(id, callback) {
        try {
            var db = this.pm.DB.db;
            var trans = db.transaction(["requests"], "readwrite");
            var store = trans.objectStore(["requests"]);

            var request = store['delete'](id);

            request.onsuccess = function() {
                callback && callback(id);
            };

            request.onerror = function(e) {
                console.log(e);
            };
        } catch (e) {
            console.log(e);
        }
    };

    LocalApi.prototype.deleteHistory = function(callback) {
        var db = this.pm.DB.db;
        var clearTransaction = db.transaction(["requests"], "readwrite");
        var clearRequest = clearTransaction.objectStore(["requests"]).clear();
        clearRequest.onsuccess = function(event) {
            callback && callback();
        };
    };

    LocalApi.prototype.deleteCollectionRequest = function(id, callback) {
        var db = this.pm.DB.db;
        var trans = db.transaction(["collection_requests"], "readwrite");
        var store = trans.objectStore(["collection_requests"]);

        var request = store['delete'](id);

        request.onsuccess = function(e) {
            callback && callback(id);
        };

        request.onerror = function(e) {
            console.log(e);
        };
    };

    LocalApi.prototype.deleteAllCollectionRequests = function(id) {
        var db = this.pm.DB.db;
        var trans = db.transaction(["collection_requests"], "readwrite");

        //Get everything in the store
        var keyRange = this.IDBKeyRange.only(id);
        var store = trans.objectStore("collection_requests");

        var index = store.index("collectionId");
        var cursorRequest = index.openCursor(keyRange);

        cursorRequest.onsuccess = function(e) {
            var result = e.target.result;

            if (!result) {
                return;
            }

            var request = result.value;
            this.deleteCollectionRequest(request.id);
            result['continue']();
        };
        cursorRequest.onerror = this.onerror;
    };

    LocalApi.prototype.deleteCollection = function(id, callback) {
        var db = this.pm.DB.db;
        var trans = db.transaction(["collections"], "readwrite");
        var store = trans.objectStore(["collections"]);

        var request = store['delete'](id);

        request.onsuccess = function() {
            this.deleteAllCollectionRequests(id);
            callback && callback(id);
        };

        request.onerror = function(e) {
            console.log(e);
        };
    }

    module.exports = LocalApi;
})
