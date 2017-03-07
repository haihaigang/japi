/**
 * 业务接口服务层
 */
define(function(require) {
    require('angular');

    var Collection = require('../model/collection'),
        CollectionRequest = require('../model/collection-request');

    var LocalApi = require('./api/local-api'),
        RemoteApi = require('./api/remote-api');

    var selfApi = new LocalApi();

    angular.module('apiService', ['ajaxService'])
        .factory('pm', ['$http', '$rootScope', 'CONFIG', 'Ajax', function($http, $rootScope, CONFIG, Ajax) {
            var pm = {};

            

            pm.DB = {
                saveCollection: function(collection, callback) {
                    selfApi.saveCollection(collection, callback);
                },

                saveCollectionRequest: function(req, callback) {
                    selfApi.saveCollectionRequest(req, callback);
                    
                },

                getCollection: function(id, callback) {
                    selfApi.getCollection(id, callback);
                    
                },

                getCollections: function(callback) {
                    selfApi.getCollections(callback);
                    
                },

                getAllRequestsInCollection: function(collection, callback) {
                    selfApi.getAllRequestsInCollection(collection, callback);
                    
                },

                addRequest: function(historyRequest, callback) {
                    selfApi.addRequest(historyRequest, callback);
                    
                },

                getRequest: function(id, callback) {
                    selfApi.getRequest(id, callback);
                    
                },

                getCollectionRequest: function(id, callback) {
                    selfApi.getCollectionRequest(id, callback);
                    
                },


                getAllRequestItems: function(callback) {
                    selfApi.getAllRequestItems(callback);
                    
                },

                deleteRequest: function(id, callback) {
                    selfApi.deleteRequest(id, callback);
                    
                },

                deleteHistory: function(callback) {
                    selfApi.deleteHistory(callback);
                    
                },

                deleteCollectionRequest: function(id, callback) {
                    selfApi.deleteCollectionRequest(id, callback);
                },

                deleteAllCollectionRequests: function(id) {
                    selfApi.deleteAllCollectionRequests(id);
                    
                },

                deleteCollection: function(id, callback) {
                    selfApi.deleteCollection(id, callback);
                }
            };

            pm.ajax = Ajax;

            return pm;
        }]);
})
