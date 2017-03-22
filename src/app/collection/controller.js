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
                            templateUrl: 'app/collection/view/list.html',
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
                .state('collections.preview', {
                    url: '/preview/:id',
                    views: {
                        'main@collections': {
                            templateUrl: 'app/collection/view/preview-sidebar.html',
                            controller: 'CollectionPreviewController'
                        }
                    }
                })
                .state("collections.preview2", {
                    url: "/preview2/:id",
                    views: {
                        "main@collections": {
                            templateUrl: "app/collection/view/preview.html",
                            controller: "CollectionPreviewController"
                        }
                    }
                })
                .state('collections.model', {
                    url: '/model',
                    views: {
                        'main@collections': {
                            templateUrl: 'app/collection/view/model2.html',
                            controller: 'CollectionModelController'
                        }
                    }
                })
                .state('collections.map', {
                    url: '/map',
                    views: {
                        'main@collections': {
                            templateUrl: 'app/collection/view/map.html',
                            controller: 'CollectionMapController'
                        }
                    }
                })

        }])
        //列表
        .controller('CollectionListController', [
            '$scope', '$state', '$stateParams', 'Collection',
            function($scope, $state, $stateParams, Collection) {
                $scope.page = Collection;
                $scope.page.search();
                $scope.breadcrumbs = $scope.page.init($state);
            }
        ])
        //添加编辑
        .controller('CollectionSaveController', [
            '$scope', '$state', '$stateParams', '$location', 'Collection',
            function($scope, $state, $stateParams, $location, Collection) {
                $scope.page = Collection;
                $scope.page.query($stateParams.id);
                $scope.breadcrumbs = $scope.page.init($state);
            }
        ])
        //预览
        .controller('CollectionPreviewController', [
            '$scope', '$state', '$stateParams', '$location', 'Collection',
            function($scope, $state, $stateParams, $location, Collection) {
                $scope.page = Collection;
                $scope.page.preview($stateParams.id);
            }
        ])
        //模型
        .controller('CollectionModelController', [
            '$scope', '$state', '$stateParams', '$location', 'Collection',
            function($scope, $state, $stateParams, $location, Collection) {
                $scope.page = Collection;
                $scope.page.getAllRequests();

                $scope.tog = function(item){
                    item.show = !item.show;
                }
            }
        ])
        //模型
        .controller('CollectionMapController', [
            '$scope', '$state', '$stateParams', '$location', 'Collection',
            function($scope, $state, $stateParams, $location, Collection) {
                $scope.page = Collection;
                $scope.page.getDataForMap();
            }
        ])

})
