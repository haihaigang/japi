/**
 * 服务模块
 */
define(function(require) {
    require('angular');
    require('../base/service-api');
    require('../base/service-ajax');

    angular.module('homeService', ['ajaxService'])
        .factory('Home', ['$rootScope', '$location', 'Ajax', 'CONFIG', 'pm', function($rootScope, $location, Ajax, CONFIG, pm) {
            var result = {
                max: 10,//最大条数
                collections: null,
                collectionRequests: null,
                getCollections: function(callback) {
                    pm.DB.getCollections(function(response) {
                        var ret = [];
                        for (var i in response) {
                            if(i >= result.max){
                                break;
                            }
                            ret[i] = response[i];
                            // pm.DB.getAllRequestsInCollection(ret[i],function(requests){
                            //     ret[i].count = requests.length;
                            // })
                        }
                        result.collections = ret;
                    });
                },
                getCollectionRequest: function(callback) {
                    pm.DB.getAllRequestsInCollection({}, function(response) {
                        var ret = [];
                        for (var i in response) {
                            if(i >= result.max){
                                break;
                            }
                            ret[i] = response[i];
                        }
                        result.collectionRequests = ret;
                    });
                },
            };

            return angular.extend(result, Ajax);
        }])
})
