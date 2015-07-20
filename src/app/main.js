define(function(require) {
    require('jquery');
    require('requester');
    require('datetimepicker');
    require('angular');
    require('angular-ui-router');
    require('ng-grid');
    require('./base/directive-dialog');
    require('./base/directive-form');
    require('./base/controller');
    require('./header/controller');
    require('./home/controller');
    require('./collection/controller');
    require('./request/controller');

    //声明一个基础模块，
    angular.module('baseModule',[]);

    var routerApp = angular.module('routerApp', [
        'ui.router',
        'ngGrid',
        'baseModule',
        'dialogDirective',
        'formDirective',
        'mainModule',
        'headerModule',
        'homeModule',
        'collectionModule',
        'requestModule'
    ]);

    //使用已定义模块名称，需要在模块声明之后在引入
    require('./base/config');
    require('./base/service-base');
    require('./base/directive-base');
    require('./base/directive-list');
    require('./base/filter-base');

    routerApp.constant('AUTHOR', 'hgwnag');

    /**
     * 由于整个应用都会和路由打交道，所以这里把$state和$stateParams这两个对象放到$rootScope上，方便其它地方引用和注入。
     * 这里的run方法只会在angular启动的时候运行一次。
     * 这里可以注册全局的事件监听
     * @param  {[type]} $rootScope
     * @param  {[type]} $state
     * @param  {[type]} $stateParams
     * @return {[type]}
     */
    routerApp.run(function($rootScope, $state, $stateParams, $location, Auth) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $rootScope.$on('$stateChangeStart', function(evt, next, current) {
            var roles = next.data && next.data.roles;
            if (next.name != 'login' && next.name != 'error' && !Auth.isAuthorized(roles)) {
                //$location.url('login');
            }
        })

        $rootScope.$on('$stateChangeError', function(evt, next, current) {
            $location.path('error');
        })

        pm.init();
    });

    /**
     * 配置路由。
     * 注意这里采用的是ui-router这个路由，而不是ng原生的路由。
     * ng原生的路由不能支持嵌套视图，所以这里必须使用ui-router。
     * @param  {[type]} $stateProvider
     * @param  {[type]} $urlRouterProvider
     * @param  {[type]} ROLES
     * @return {[type]}
     */
    routerApp.config(function($stateProvider, $urlRouterProvider, ROLES) {
        $urlRouterProvider.otherwise('404');
        $stateProvider
            .state('login', {
                url: '/login',
                views: {
                    '': {
                        templateUrl: 'app/account/view/login.html',
                        controller: 'LoginController'
                    }
                },
                data: {
                    roles: [ROLES.GUEST]
                }
            })
            .state('error', {
                url: '/404',
                views: {
                    '': {
                        templateUrl: 'app/main.html'
                    },
                    'menu@error': {
                        templateUrl: 'app/header/view/menu.html',
                        controller: 'HeaderController'
                    },
                    'main@error': {
                        templateUrl: 'app/base/view/404.html'
                    }
                },
                data: {
                    roles: [ROLES.GUEST]
                }
            })
            .state('home', {
                url: '/index',
                views: {
                    '': {
                        templateUrl: 'app/main.html'
                    },
                    'menu@home': {
                        templateUrl: 'app/header/view/menu.html',
                        controller: 'HeaderController'
                    },
                    'main@home': {
                        templateUrl: 'app/home/view/index.html',
                        controller: 'HomeController'
                    }
                }
            })
    });

    angular.bootstrap(document, ["routerApp"]);
});
