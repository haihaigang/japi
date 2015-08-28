/**
 * 头部模块
 */
define(function(require) {
    require('angular');
    require('./service');

    angular.module("headerModule", ["headerService"])
        .controller('HeaderController', ['$scope', '$location', 'Auth', 'Storage', function($scope, $location, Auth, Storage) {
            $scope.menus = [{
                name: '项目',
                link: 'collections'
            }, {
                name: '接口',
                link: 'requests'
            }, {
                name: '关于',
                link: 'about',
                subMenus: [{
                    name: '预览',
                    link: 'collections.preview({id:48})',
                }]
            }];

            //添加预览快捷入口
        }]);

})
