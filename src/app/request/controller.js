/**
 * 接口模块
 */
define(function(require) {
    require('angular');
    require('../request/service');

    angular.module("requestModule", ["requestService", "baseModule"])
        .config(['$stateProvider', 'ROLES', function($stateProvider, ROLES) {
            $stateProvider
                .state('requests', {
                    url: '/requests/{collectionId:[0-9a-z-]{0,38}}',
                    views: {
                        '': {
                            templateUrl: 'app/main.html'
                        },
                        'menu@requests': {
                            templateUrl: 'app/header/view/menu.html',
                            controller: 'HeaderController'
                        },
                        'main@requests': {
                            templateUrl: 'app/request/view/list.html',
                            controller: 'RequestListController'
                        }
                    },
                    data: {
                        roles: [ROLES.ADMIN]
                    }
                })
                .state('requests.add', {
                    url: '/add',
                    views: {
                        'main@requests': {
                            templateUrl: 'app/base/view/form.html',
                            controller: 'RequestSaveController'
                        }
                    }
                })
                .state('requests.edit', {
                    url: '/edit/:id',
                    views: {
                        'main@requests': {
                            templateUrl: 'app/base/view/form.html',
                            controller: 'RequestSaveController'
                        }
                    },
                    data: {}
                })
        }])
        //列表
        .controller('RequestListController', [
            '$scope', '$state', '$stateParams', 'Request',
            function($scope, $state, $stateParams, Request) {
                $scope.page = Request;
                $scope.page.search($stateParams);
                $scope.breadcrumbs = $scope.page.init($state);
                $scope.page.getCondition($stateParams);
            }
        ])
        //添加编辑
        .controller('RequestSaveController', [
            '$scope', '$state', '$stateParams', 'Request',
            function($scope, $state, $stateParams, Request) {
                $scope.page = Request;
                $scope.page.query($stateParams.id);
                $scope.breadcrumbs = $scope.page.init($state);
            }
        ])
})
