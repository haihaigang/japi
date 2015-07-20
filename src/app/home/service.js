/**
 * 服务模块
 */
define(function(require) {
    require('angular');
    require('../base/service-ajax');

    angular.module('homeService', ['ajaxService'])
        .factory('Home', ['$rootScope', '$location', 'Ajax', 'CONFIG', function($rootScope, $location, Ajax, CONFIG) {
            var result = {
                max: 10,//最大条数
                collections: null,
                collectionRequests: null,
                importFromPM: function(files) {
                    if (!files || !files.length || files.length == 0) {
                        return false;
                    }

                    var reader = new FileReader();
                    reader.onload = function(res) {
                        var data = JSON.parse(this.result);
                        if (!data.id || !data.requests) {
                            return false;
                        }

                        var col = new Collection();
                        col.setId(data.id);
                        col.setName(data.name);
                        col.setDesc(data.description);
                        col.setVersion(data.version);
                        pm.indexedDB.saveCollection(col, function(collection) {
                            for (var i in data.requests) {
                                var d = data.requests[i],
                                    req = new CollectionRequest();
                                req.setCollectionId(collection.id);
                                req.setProject(collection.name);
                                req.setId(d.id);
                                req.setName(d.name);
                                req.setUrl(d.url);
                                req.setDesc(d.description);
                                req.setMethod(d.method);
                                req.setDataMode(d.dataMode);

                                pm.indexedDB.saveCollectionRequest(req);
                            }
                        });
                    }
                    reader.readAsText(files[0]);
                },
                getCollections: function(callback) {
                    pm.indexedDB.getCollections(function(response) {
                        var ret = [];
                        for (var i in response) {
                            if(i >= result.max){
                                break;
                            }
                            ret[i] = Ajax.formatData(response[i]);
                            // pm.indexedDB.getAllRequestsInCollection(ret[i],function(requests){
                            //     ret[i].count = requests.length;
                            // })
                        }
                        result.collections = ret;
                    });
                },
                getCollectionRequest: function(callback) {
                    pm.indexedDB.getAllRequestsInCollection({}, function(response) {
                        var ret = [];
                        for (var i in response) {
                            if(i >= result.max){
                                break;
                            }
                            ret[i] = Ajax.formatData(response[i]);
                        }
                        result.collectionRequests = ret;
                    });
                },
            };

            return angular.extend(result, Ajax);
        }])
})
