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
                    url: '/requests',
                    views: {
                        '': {
                            templateUrl: 'app/main.html'
                        },
                        'menu@requests': {
                            templateUrl: 'app/header/view/menu.html',
                            controller: 'HeaderController'
                        },
                        'main@requests': {
                            templateUrl: 'app/base/view/list.html',
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
                //page.title += '';
        }])
        //列表
        .controller('RequestListController', [
            '$scope', '$state', '$stateParams', 'Request',
            function($scope, $state, $stateParams, Request) {

                $scope.page = Request;

                $scope.page.search({
                    pageSize: $scope.pagingOptions.pageSize,
                    page: $scope.pagingOptions.currentPage
                });

                $scope.columns = $scope.gridOptions.columnDefs = [{
                    field: 'id',
                    displayName: '序号',
                    width: 60,
                    pinnable: false,
                    sortable: false
                }, {
                    field: 'name',
                    displayName: '接口名称',
                    enableCellEdit: true,
                    width: 120
                }, {
                    field: 'url',
                    displayName: '接口地址',
                    enableCellEdit: true
                }, {
                    field: 'desc',
                    displayName: '接口描述',
                    enableCellEdit: true
                }, {
                    field: 'project',
                    displayName: '所属项目',
                    enableCellEdit: true,
                    width: 120
                }, {
                    field: 'id',
                    displayName: '操作',
                    enableCellEdit: false,
                    sortable: false,
                    pinnable: false,
                    cellTemplate: '<div class="ngCellOpt"><a ui-sref=".edit({id:row.getProperty(col.field)})" id="{{row.getProperty(col.field)}}">编辑</a><a ui-sref=".edit({id:row.getProperty(col.field)})" id="{{row.getProperty(col.field)}}">删除</a></div>'
                }];
                $scope.breadcrumbs = $scope.page.init($state);
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
