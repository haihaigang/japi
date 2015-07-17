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
                condition: null, //搜索条件
                query: function(id) {
                    pm.indexedDB.getCollectionRequest(id, function(response) {
                        pm.indexedDB.getCollections(function(response1){
                            var fdata = [];
                            for(var i in response1){
                                fdata.push(Ajax.formatData(response1[i]));
                            }
                            for(var i in response.data){
                                for(var j in response.data[i].fields){
                                    for(var k in response.data[i].fields[j].selects){
                                        if(response.data[i].fields[j].selects[k].name="project"){
                                            response.data[i].fields[j].selects[k].data = fdata;
                                        }
                                    }
                                }
                            }
                            console.log(response)
                            result.groups = response;
                            $rootScope.$apply();//这里又需要添加$apply，不同于collection中的用法
                        })
                    });
                },
                save: function(callback) {
                    var v;
                    for(var i in result.groups.data){
                        for(var j in result.groups.data[i].fields){
                            for(var k in result.groups.data[i].fields[j].selects){
                                if(result.groups.data[i].fields[j].selects[k].name="project"){
                                    v = result.groups.data[i].fields[j].selects[k].value;
                                }
                            }
                        }
                    }
                    result.groups.collectionId = v;
                    pm.indexedDB.saveCollectionRequest(result.groups, function(response) {
                        $location.path('requests');
                        $rootScope.$apply();
                    });
                },
                search: function(data) {
                    result.condition = data;
                    pm.indexedDB.getAllRequestsInCollection(data,function(response) {
                        for (var i in response) {
                            response[i] = Ajax.formatData(response[i]);
                        }
                        result.pageData = response;
                        $rootScope.$apply();
                    });
                },
                remove: function(id) {
                    pm.indexedDB.deleteCollectionRequest(id, function(response) {
                        result.search(result.condition);
                    });
                }
            };

            return angular.extend(result, Ajax);
        }])
})
