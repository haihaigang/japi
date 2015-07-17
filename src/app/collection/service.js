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
                query: function(id) {
                    pm.indexedDB.getCollection(id, function(response) {
                        result.groups = response;
                        //$rootScope.$apply();//为什么这里不能添加$apply
                    });
                },
                save: function(callback) {
                    pm.indexedDB.saveCollection(result.groups, function(response) {
                        $location.path('collections');
                        $rootScope.$apply();
                    });
                },
                search: function(data) {
                    result.condition = data;
                    pm.indexedDB.getCollections(function(response) {
                        for (var i in response) {
                            response[i] = Ajax.formatData(response[i]);
                        }
                        result.pageData = response;
                        $rootScope.$apply();
                    });
                },
                remove: function(id) {
                    pm.indexedDB.deleteCollection(id, function(response) {
                        result.search(result.condition);
                    });
                }
            };

            return angular.extend(result, Ajax);
        }])
})
