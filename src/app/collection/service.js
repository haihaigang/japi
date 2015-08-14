/**
 * 项目服务模块
 */
define(function(require) {
    require('angular');
    require('../base/service-ajax');

    angular.module('collectionService', ['ajaxService'])
        .factory('Collection', ['$rootScope', '$location', 'Ajax', 'CONFIG', 'errorService', function($rootScope, $location, Ajax, CONFIG, errorService) {
            var result = {
                title: '项目管理',
                groups: null, //表单数据
                pageData: null, //分页数据
                condition: null, //搜索条件
                data: null, //某项目数据（含接口）
                query: function(id) {
                    pm.indexedDB.getCollection(id, function(response) {
                        result.groups = response.toForm();
                        $rootScope.$apply(); //为什么这里不能添加$apply，必须加上，以便立即更新视图
                    });
                },
                save: function(callback) {
                    var data = Ajax.formatData(result.groups);
                    pm.indexedDB.saveCollection(data, function(response) {
                        $location.path('collections');
                        $rootScope.$apply();
                    });
                },
                search: function(data) {
                    result.condition = data;
                    pm.indexedDB.getCollections(function(response) {
                        result.pageData = response;
                        $rootScope.$apply();
                    });
                },
                remove: function(id) {
                    pm.indexedDB.deleteCollection(id, function(response) {
                        result.search(result.condition);
                    });
                },
                export: function(id) {
                    pm.indexedDB.getCollection(id, function(response) {
                        pm.indexedDB.getAllRequestsInCollection({
                            collectionId: id
                        }, function(rResponse) {
                            response.requests = rResponse;

                            // document.write((JSON.stringify(response)))

                            //TODO 怎么存储导出的数据
                            Ajax.post({
                                url: CONFIG.HOST_API + CONFIG.API_COLLECTION_SYNC,
                                data: 'id=' + response.remoteId + '&data=' + encodeURIComponent(JSON.stringify(response)),
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                                }
                            }, function(aResponse) {
                                if (aResponse.code != 0) {
                                    errorService.showAlert(aResponse.message);
                                }
                                response.remoteId = aResponse.body;
                                pm.indexedDB.saveCollection(response, function(cResponse) {});
                            })
                        })
                    })
                },
                /**
                 * 预览接口，根据传入id长度获取不同状态数据，长度小于32位从服务端获取否则从本地获取
                 */
                preview: function(id) {
                    if (id.length < 32) {
                        Ajax.get({
                            url: CONFIG.HOST_API + CONFIG.API_COLLECTION_SYNC,
                            data: {
                                id: id
                            }
                        }, function(response) {
                            if (response.code != 0) {
                                errorService.showAlert(response.message);
                            }
                            response.body.requests.sort(Ajax.order);
                            result.data = response.body;
                        })
                    } else {
                        pm.indexedDB.getCollection(id, function(response) {
                            pm.indexedDB.getAllRequestsInCollection({
                                collectionId: id
                            }, function(rResponse) {
                                rResponse.sort(Ajax.order);
                                response.requests = rResponse;
                                result.data = response;
                            })
                        })
                    }
                }
            };

            return angular.extend(result, Ajax);
        }])
})
