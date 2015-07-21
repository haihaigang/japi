/**
 * 关于我们模块
 */
define(function(require) {
    require('angular');
    require('../about/service');

    angular.module("aboutModule", ["aboutService"])
        .config(['$stateProvider', 'ROLES', function($stateProvider, ROLES) {
            $stateProvider
                .state('about', {
                    url: '/about',
                    views: {
                        '': {
                            templateUrl: 'app/main.html'
                        },
                        'menu@about': {
                            templateUrl: 'app/header/view/menu.html',
                            controller: 'HeaderController'
                        },
                        'main@about': {
                            templateUrl: 'app/about/view/index.html',
                            controller: 'AboutController'
                        }
                    },
                    data: {
                        roles: [ROLES.ADMIN]
                    }
                })

        }])
        //列表
        .controller('AboutController', [
            '$scope', '$state', '$stateParams', 'About',
            function($scope, $state, $stateParams, About) {
                $scope.page = About;

                $('input[type="file"]').on('change', function() {
                    About.importFromPM(this.files);
                });
            }
        ])
})
