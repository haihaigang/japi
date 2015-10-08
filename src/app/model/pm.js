define(function(require, exports, module) {
    var Collection = require('../model/collection'),
        CollectionRequest = require('../model/collection-request');

    function Request() {
        this.id = "";
        this.name = "";
        this.description = "";
        this.url = "";
        this.method = "";
        this.headers = "";
        this.data = "";
        this.dataMode = "params";
        this.timestamp = 0;
    }

    function sortAlphabetical(a, b) {
        var counter;
        if (a.name.length > b.name.legnth)
            counter = b.name.length;
        else
            counter = a.name.length;

        for (var i = 0; i < counter; i++) {
            if (a.name[i] == b.name[i]) {
                continue;
            } else if (a.name[i] > b.name[i]) {
                return 1;
            } else {
                return -1;
            }
        }
        return 1;
    }

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    function guid() {
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    var pm = {};

    pm.debug = true;

    pm.indexedDB = {};
    pm.indexedDB.db = null;
    pm.indexedDB.modes = {
        readwrite: "readwrite",
        readonly: "readonly"
    };

    pm.fs = {};
    pm.webUrl = "http://getpostman.com";

    // IndexedDB implementations still use API prefixes
    var myIndexedDB = window.indexedDB || // Use the standard DB API
        window.mozIndexedDB || // Or Firefox's early version of it
        window.webkitIndexedDB; // Or Chrome's early version
    // Firefox does not prefix these two:
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
    var IDBCursor = window.IDBCursor || window.webkitIDBCursor;

    /*
     Components

     history - History of sent requests. Can be toggled on and off
     collections - Groups of requests. Can be saved to a file. Saved requests can have a name and description to document
     the request properly.
     settings - Settings Postman behavior
     layout - Manages quite a bit of the interface
     currentRequest - Everything to do with the current request loaded in Postman. Also manages sending, receiving requests
     and processing additional parameters
     urlCache - Needed for the autocomplete functionality
     helpers - Basic and OAuth helper management. More helpers will be added later.
     keymap - Keyboard shortcuts
     envManager - Environments to customize requests using variables.
     filesystem - Loading and saving files from the local filesystem.
     indexedDB - Backend database. Right now Postman uses indexedDB.

     I am not exactly happy with the code I have written. Most of this has resulted from rapid UI
     prototyping. I hope to rewrite this using either Ember or Backbone one day! Till then I'll be
     cleaning this up bit by bit.
     */

    pm.init = function() {
        pm.indexedDB.open();
    };

    pm.indexedDB = {
        TABLE_HEADER_PRESETS: "header_presets",

        onerror: function(event, callback) {
            console.log(event);
        },

        open_v21: function() {
            var request = myIndexedDB.open("postman", "POSTman request history");
            request.onsuccess = function(e) {
                var v = "0.6";
                pm.indexedDB.db = e.target.result;
                var db = pm.indexedDB.db;

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

            request.onfailure = pm.indexedDB.onerror;
        },

        open_latest: function() {
            var v = 11;
            var request = myIndexedDB.open("postman", v);
            request.onupgradeneeded = function(e) {

                var db = e.target.result;
                pm.indexedDB.db = db;
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
                console.log('db.start:' + (new Date().getTime() - tick))
                pm.indexedDB.db = e.target.result;
                // pm.history.getAllRequests();
                // pm.envManager.getAllEnvironments();
                // pm.headerPresets.init();
            };

            request.onerror = pm.indexedDB.onerror;
        },

        open: function() {
            var m = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
            if (m && parseInt(m[2]) < 23) {
                pm.indexedDB.open_v21();
            } else {
                pm.indexedDB.open_latest();
            }
        },

        saveCollection: function(collection, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction(["collections"], "readwrite");
            var store = trans.objectStore("collections");

            var request;

            if (collection.id) {
                var boundKeyRange = IDBKeyRange.only(collection.id);
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
        },

        saveCollectionRequest: function(req, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction(["collection_requests"], "readwrite");
            var store = trans.objectStore("collection_requests");

            if (req.id) {
                var boundKeyRange = IDBKeyRange.only(req.id);
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
        },

        getCollection: function(id, callback) {
            var db = pm.indexedDB.db;
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
                cursorRequest.onerror = pm.indexedDB.onerror;
            }
        },

        getCollections: function(callback) {
            console.log('getCollections:' + (new Date().getTime() - tick))
            var db = pm.indexedDB.db;

            if (db == null) {
                return;
            }

            var trans = db.transaction(["collections"], "readwrite");
            var store = trans.objectStore("collections");

            //Get everything in the store
            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);
            var numCollections = 0;
            var items = [];
            cursorRequest.onsuccess = function(e) {
                var result = e.target.result;
                if (!result) {
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
        },

        getAllRequestsInCollection: function(collection, callback) {
            var db = pm.indexedDB.db;
            if (db == null) {
                return;
            }

            var trans = db.transaction(["collection_requests"], "readwrite");

            //Get everything in the store
            var keyRange = IDBKeyRange.lowerBound(0);
            if (collection.collectionId) {
                keyRange = IDBKeyRange.only(collection.collectionId);
            }
            var store = trans.objectStore("collection_requests");

            var index = store.index("collectionId");
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
            cursorRequest.onerror = pm.indexedDB.onerror;
        },

        addRequest: function(historyRequest, callback) {
            var db = pm.indexedDB.db;
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
            var db = pm.indexedDB.db;
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
            cursorRequest.onerror = pm.indexedDB.onerror;
        },

        getCollectionRequest: function(id, callback) {
            var db = pm.indexedDB.db;
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
                cursorRequest.onerror = pm.indexedDB.onerror;
            }
        },


        getAllRequestItems: function(callback) {
            var db = pm.indexedDB.db;
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

            cursorRequest.onerror = pm.indexedDB.onerror;
        },

        deleteRequest: function(id, callback) {
            try {
                var db = pm.indexedDB.db;
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
        },

        deleteHistory: function(callback) {
            var db = pm.indexedDB.db;
            var clearTransaction = db.transaction(["requests"], "readwrite");
            var clearRequest = clearTransaction.objectStore(["requests"]).clear();
            clearRequest.onsuccess = function(event) {
                callback && callback();
            };
        },

        deleteCollectionRequest: function(id, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction(["collection_requests"], "readwrite");
            var store = trans.objectStore(["collection_requests"]);

            var request = store['delete'](id);

            request.onsuccess = function(e) {
                callback && callback(id);
            };

            request.onerror = function(e) {
                console.log(e);
            };
        },

        deleteAllCollectionRequests: function(id) {
            var db = pm.indexedDB.db;
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
                pm.indexedDB.deleteCollectionRequest(request.id);
                result['continue']();
            };
            cursorRequest.onerror = pm.indexedDB.onerror;
        },

        deleteCollection: function(id, callback) {
            var db = pm.indexedDB.db;
            var trans = db.transaction(["collections"], "readwrite");
            var store = trans.objectStore(["collections"]);

            var request = store['delete'](id);

            request.onsuccess = function() {
                pm.indexedDB.deleteAllCollectionRequests(id);
                callback && callback(id);
            };

            request.onerror = function(e) {
                console.log(e);
            };
        }
    };

    pm.urlCache = {
        urls: [],
        addUrl: function(url) {
            if ($.inArray(url, this.urls) == -1) {
                pm.urlCache.urls.push(url);
                this.refreshAutoComplete();
            }
        },

        refreshAutoComplete: function() {
            $("#url").autocomplete({
                source: pm.urlCache.urls,
                delay: 50
            });
        }
    };

    module.exports = pm;
})
