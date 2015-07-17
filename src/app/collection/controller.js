/**
 * 项目模块
 */
define(function(require) {
    require('angular');
    require('../collection/service');

    angular.module("collectionModule", ["collectionService", "baseModule"])
        .config(['$stateProvider', 'ROLES', function($stateProvider, ROLES) {
            $stateProvider
                .state('collections', {
                    url: '/collections',
                    views: {
                        '': {
                            templateUrl: 'app/main.html'
                        },
                        'menu@collections': {
                            templateUrl: 'app/header/view/menu.html',
                            controller: 'HeaderController'
                        },
                        'main@collections': {
                            templateUrl: 'app/base/view/list.html',
                            controller: 'CollectionListController'
                        }
                    },
                    data: {
                        roles: [ROLES.ADMIN]
                    }
                })
                .state('collections.add', {
                    url: '/add',
                    views: {
                        'main@collections': {
                            templateUrl: 'app/base/view/form.html',
                            controller: 'CollectionSaveController'
                        }
                    }
                })
                .state('collections.edit', {
                    url: '/edit/:id',
                    views: {
                        'main@collections': {
                            templateUrl: 'app/base/view/form.html',
                            controller: 'CollectionSaveController'
                        }
                    },
                    data: {}
                })
                //page.title += '';
        }])
        //列表
        .controller('CollectionListController', [
            '$scope', '$state', '$stateParams', 'Collection',
            function($scope, $state, $stateParams, Collection) {

                $scope.page = Collection;

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
                    displayName: '项目名称',
                    enableCellEdit: true,
                    width: 120
                }, {
                    field: 'desc',
                    displayName: '项目描述',
                    enableCellEdit: true
                }, {
                    field: 'version',
                    displayName: '项目版本',
                    enableCellEdit: true,
                    width: 120
                }, {
                    field: 'sort',
                    displayName: '...',
                    enableCellEdit: true,
                    width: 120
                }, {
                    field: 'id',
                    displayName: '操作',
                    enableCellEdit: false,
                    sortable: false,
                    pinnable: false,
                    cellTemplate: '<div class="ngCellOpt"><a ui-sref=".edit({id:row.getProperty(col.field)})">编辑</a><div j-delete j-click="page.remove(row.getProperty(col.field))">删除</div></div>'
                }];
                $scope.breadcrumbs = $scope.page.init($state);
            }
        ])
        //添加编辑
        .controller('CollectionSaveController', [
            '$scope', '$state', '$stateParams','$location', 'Collection',
            function($scope, $state, $stateParams, $location, Collection) {
                $scope.page = Collection;
                $scope.page.query($stateParams.id);
                $scope.breadcrumbs = $scope.page.init($state);
            }
        ])
})
