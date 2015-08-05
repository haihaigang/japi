/**
 * 项目服务模块
 */
define(function(require) {
    require('angular');
    require('../base/service-ajax');

    angular.module('collectionService', ['ajaxService'])
        .factory('Collection', ['$rootScope', '$location', 'Ajax', 'CONFIG', function($rootScope, $location, Ajax, CONFIG) {
            var result = {
                title: '项目管理',
                groups: null, //表单数据
                pageData: null, //分页数据
                condition: null, //搜索条件
                requests: null,//某项目下的所有接口
                query: function(id) {
                    pm.indexedDB.getCollection(id, function(response) {
                        result.groups = response.toForm();
                        $rootScope.$apply();//为什么这里不能添加$apply，必须加上，以便立即更新视图
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
                export: function(id){
                    pm.indexedDB.getCollection(id, function(response){
                        pm.indexedDB.getAllRequestsInCollection({collectionId:id},function(rResponse){
                            response.requests = rResponse;

                            //TODO 怎么存储导出的数据
                        })
                    })
                },
                preview: function(id){
                    pm.indexedDB.getAllRequestsInCollection({collectionId:id},function(rResponse){
                        result.requests = rResponse;
                        console.log(rResponse)
                    })
                }
            };

            return angular.extend(result, Ajax);
        }])
})
