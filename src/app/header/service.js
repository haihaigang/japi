define(function(require) {
    require('angular');

    var service = angular.module('headerService', []);
    service.factory('header', ['$http', '$q', function($http, $q) {

        return {};
    }])

})
