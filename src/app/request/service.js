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
                        pm.indexedDB.getCollections(function(response1) {
                            var fdata = [],
                                flag = false;
                            for (var i in response1) {
                                fdata.push(Ajax.formatData(response1[i]));
                            }
                            for (var i in response.data) {
                                for (var j in response.data[i].fields) {
                                    if (response.data[i].fields[j].key = "project") {
                                        response.data[i].fields[j].enumObj = fdata;
                                        flag = true;
                                        break;
                                    }
                                }
                                if (flag) break;
                            }
                            // console.log(response)
                            result.groups = response;
                            $rootScope.$apply(); //这里又需要添加$apply，不同于collection中的用法
                        })
                    });
                },
                save: function(callback) {
                    var v;
                    for (var i in result.groups.data) {
                        for (var j in result.groups.data[i].fields) {
                            if (result.groups.data[i].fields[j].key = "project") {
                                v = result.groups.data[i].fields[j].value;
                                break;
                            }
                            if (v) break;
                        }
                        if (v) break;
                    }
                    result.groups.collectionId = v;
                    pm.indexedDB.saveCollectionRequest(result.groups, function(response) {
                        $location.path('requests');
                        $rootScope.$apply();
                    });
                },
                search: function(data) {
                    data = data || [];
                    data = Ajax.formatCondition(result.conditionItems);
                    pm.indexedDB.getAllRequestsInCollection(data, function(response) {
                        for (var i in response) {
                            response[i] = Ajax.formatData(response[i]);
                        }
                        // result.pageData = response;
                        // $rootScope.$apply();
                        
                        pm.indexedDB.getCollections(function(response1){
                            for(var i in response1){
                                response1[i] = Ajax.formatData(response1[i]);
                            }
                            for(var i in response){
                                for(var j in response1){
                                    if(response[i].collectionId == response1[j].id){
                                        response[i].project = response1[j].name;
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
                getCondition: function() {
                    var d = [],
                        d1 = {
                            key: 'project',
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
                            response[i] = Ajax.formatData(response[i]);
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
