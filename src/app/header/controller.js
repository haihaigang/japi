/**
 * 头部模块
 */
define(function(require) {
    require('angular');
    require('./service');

    angular.module("headerModule", ["headerService"])
        .controller('HeaderController', ['$scope', '$location', 'Auth', function($scope, $location, Auth) {
            $scope.menus = [{
                name: '项目',
                link: 'collections'
            }, {
                name: '接口',
                link: 'requests'
            }, {
                name: '关于',
                link: 'about'
            }];
        }]);

})
