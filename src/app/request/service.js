/**
 * 接口服务模块
 */
define(function(require) {
    require('angular');
    require('../base/service-ajax');

    angular.module('requestService', ['ajaxService'])
        .factory('Request', ['$rootScope', '$location', 'Ajax', 'CONFIG', function($rootScope, $location, Ajax, CONFIG) {
            var result = {
                title: '接口管理',
                groups: null, //表单数据
                pageData: null, //分页数据
                condition: null, //当前搜索条件
                conditionItems: null, //搜索条件项
                query: function(id) {
                    pm.indexedDB.getCollectionRequest(id, function(response) {
                        var data = response.toForm();
                        pm.indexedDB.getCollections(function(cResponse) {
                            var fdata = [],
                                flag = false;
                            for (var i in data.data) {
                                for (var j in data.data[i].fields) {
                                    if (data.data[i].fields[j].key == "collectionId") {
                                        data.data[i].fields[j].enumObj = cResponse;
                                        flag = true;
                                        break;
                                    }
                                }
                                if (flag) break;
                            }
                            result.groups = data;
                            $rootScope.$apply();
                        })
                    });
                },
                save: function(callback) {
                    var data = Ajax.formatData(result.groups);
                    pm.indexedDB.saveCollectionRequest(data, function(response) {
                        $location.path('requests');
                        $rootScope.$apply();
                    });
                },
                search: function(data) {
                    if (!data) {
                        data = Ajax.formatCondition(result.conditionItems);
                    }
                    pm.indexedDB.getAllRequestsInCollection(data, function(response) {
                        pm.indexedDB.getCollections(function(cResponse) {
                            for (var i in response) {
                                for (var j in cResponse) {
                                    if (response[i].collectionId == cResponse[j].id) {
                                        response[i].project = cResponse[j].name;
                                    }
                                }
                            }
                            result.pageData = response;
                            $rootScope.$apply();
                        })
                    });
                },
                remove: function(id) {
                    pm.indexedDB.deleteCollectionRequest(id, function(response) {
                        result.search(result.condition);
                    });
                },
                getCondition: function(stateParams) {
                    var d = [],
                        d1 = {
                            key: 'collectionId',
                            type: 'select',
                            title: '所属项目',
                            data: []
                        },
                        d2 = {
                            key: 'name',
                            type: 'text',
                            title: '项目名称'
                        };
                    pm.indexedDB.getCollections(function(response) {
                        for (var i in response) {
                            if (response[i].id == stateParams.collectionId) {
                                d1.value = response[i].id;
                            }
                        }
                        d1.data = response;
                        d.push(d1);
                        d.push(d2);
                        result.conditionItems = d;
                        $rootScope.$apply();
                    })
                }
            };

            return angular.extend(result, Ajax);
        }])
})
