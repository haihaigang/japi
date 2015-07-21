/**
 * 首页模块
 */
define(function(require) {
    require('angular');
    require('../home/service');

    angular.module("homeModule", ["homeService"])
        //列表
        .controller('HomeController', [
            '$scope', '$state', '$stateParams', 'Home',
            function($scope, $state, $stateParams, Home) {
                $scope.page = Home;
                Home.getCollections()
                Home.getCollectionRequest()
            }
        ])
})
