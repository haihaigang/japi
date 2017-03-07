define(function(require, exports, module) {

    function RemoteApi(data) {

        this.init(data);
    }

    RemoteApi.prototype.init = function(data) {
        this.pm = { DB: {} };
    }

    RemoteApi.prototype.saveCollection = function(collection, callback) {

        if (collection.id) {} else {
            collection.id = guid();
            collection.timestamp = new Date().getTime();
        }

        Ajax.post({
            url: CONFIG.HOST_API + CONFIG.API_COLLECTION_SAVE,
            data: collection
        }, function(response) {
            callback && callback(collection);
        })
    };

    RemoteApi.prototype.saveCollectionRequest = function(req, callback) {
        if (req.id) {} else {
            req.id = guid();
            req.timestamp = new Date().getTime();
        }

        Ajax.post({
            url: CONFIG.HOST_API + CONFIG.API_REQUEST_SAVE,
            data: req
        }, function(response) {
            callback && callback(response.body);
        })
    };

    RemoteApi.prototype.getCollection = function(id, callback) {
        if (!id) {
            callback && callback(new Collection());
        } else {

            Ajax.get({
                url: CONFIG.HOST_API + CONFIG.API_COLLECTION_QUERY,
                data: {
                    id: id
                }
            }, function(response) {
                callback && callback(new Collection(response.body));
            })
        }
    }

    RemoteApi.prototype.getCollections = function(callback) {
        console.log('getCollections:' + (new Date().getTime() - tick))

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
    };

    RemoteApi.prototype.getAllRequestsInCollection = function(collection, callback) {

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
    };

    RemoteApi.prototype.addRequest = function(historyRequest, callback) {

    };

    RemoteApi.prototype.getRequest = function(id, callback) {

    };

    RemoteApi.prototype.getCollectionRequest = function(id, callback) {

        if (!id) {
            callback && callback(new CollectionRequest());
        } else {

            Ajax.get({
                url: CONFIG.HOST_API + CONFIG.API_REQUEST_QUERY,
                data: {
                    id: id
                }
            }, function(response) {
                callback && callback(new CollectionRequest(response.body));
            })
        }
    };


    RemoteApi.prototype.getAllRequestItems = function(callback) {

    };

    RemoteApi.prototype.deleteRequest = function(id, callback) {
        Ajax.post({
            url: CONFIG.HOST_API + CONFIG.API_COLLECTION_REMOVE,
            data: {
                id: id
            }
        }, function(response) {
            callback && callback(id);
        })
    };

    RemoteApi.prototype.deleteHistory = function(callback) {

    };

    RemoteApi.prototype.deleteCollectionRequest = function(id, callback) {
        Ajax.post({
            url: CONFIG.HOST_API + CONFIG.API_REQUEST_REMOVE,
            data: {
                id: id
            }
        }, function(response) {
            callback && callback(id);
        })
    };

    RemoteApi.prototype.deleteAllCollectionRequests = function(id) {

    };

    RemoteApi.prototype.deleteCollection = function(id, callback) {
        Ajax.post({
            url: CONFIG.HOST_API + CONFIG.API_COLLECTION_REMOVE,
            data: {
                id: id
            }
        }, function(response) {
            this.deleteAllCollectionRequests(id);
            callback && callback(id);
        })
    }

    module.exports = RemoteApi;
})
