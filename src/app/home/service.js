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
