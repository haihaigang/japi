/**
 * 接口模块
 */
define(function(require) {
    require('angular');
    require('../collection/service');
    require('../request/service');
    require('../home/service');

    angular.module("homeModule", ["homeService","requestService"])
        //列表
        .controller('HomeController', [
            '$scope', '$state', '$stateParams', 'Home', 'Request',
            function($scope, $state, $stateParams, Home, Request) {
                $scope.page = Home;
                Home.getCollections()
                Home.getCollectionRequest()

                $('input[type="file"]').on('change',function(){
                    Home.importFromPM(this.files);
                });

                // Home.getCollections(function(response){
                //     $scope.collections = response;
                // })

                // Home.getCollectionRequest(function(response){
                //     $scope.collectionRequests = response;
                // })
            }
        ])
})
