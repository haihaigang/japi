/**
 * 头部模块
 */
define(function(require) {
    require('angular');
    require('./service');

    angular.module("headerModule", ["headerService"])
        .controller('HeaderController', ['$scope', '$location', 'Auth', function($scope, $location, Auth) {
            $scope.Auth = Auth;

            $scope.logout = function() {
                Auth.clear();
                $location.path('login');
            }

            $scope.menus = [{
                name: '项目',
                link: 'collections',
                subMenus: [{
                    name: '新建项目',
                    link: 'collections.add'
                }]
            }, {
                name: '接口',
                link: 'requests',
                subMenus: [{
                    name: '新建接口',
                    link: 'requests.add'
                }]
            }];
        }]);

})
