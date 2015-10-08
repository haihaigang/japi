/**
 * 接口服务模块
 */
define(function(require) {
    require('angular');
    require('requester');
    require('../base/service-ajax');

    var pm = require('../model/pm');

    angular.module('requestService', ['ajaxService'])
        .factory('Request', ['$rootScope', '$location', 'Ajax', 'CONFIG','Storage', 'errorService', function($rootScope, $location, Ajax, CONFIG,Storage, errorService) {
            var result = {
                title: '接口管理',
                groups: null, //表单数据
                pageData: null, //分页数据
                condition: null, //当前搜索条件
                conditionItems: null, //搜索条件项
                query: function(id) {
                    pm.indexedDB.getCollectionRequest(id, function(response) {
                        var data = response.toForm();
                        pm.indexedDB.getCollections(function(cResponse) {
                            var fdata = [],
                                flag = false;
                            for (var i in data.data) {
                                for (var j in data.data[i].fields) {
                                    if (data.data[i].fields[j].key == "collectionId") {
                                        data.data[i].fields[j].enumObj = cResponse;
                                        //使用上次选择的项目
                                        data.data[i].fields[j].value = data.data[i].fields[j].value || Storage.get('collectionId');
                                        flag = true;
                                        break;
                                    }
                                }
                                if (flag) break;
                            }
                            result.groups = data;
                            $rootScope.$apply();
                        })
                    });
                },
                save: function(callback) {
                    var data = Ajax.formatData(result.groups);
                    //保存最后一次提交接口的项目编号，以便下次快速添加
                    Storage.set('collectionId', data.collectionId);
                    pm.indexedDB.saveCollectionRequest(data, function(response) {
                        $location.path('requests/'+data.collectionId);
                        $rootScope.$apply();
                    });
                },
                search: function(data) {
                    if (!data) {
                        data = Ajax.formatCondition(result.conditionItems);
                    }
                    data.collectionId = Storage.get('collectionId');
                    pm.indexedDB.getAllRequestsInCollection(data, function(response) {
                        pm.indexedDB.getCollections(function(cResponse) {
                            for (var i in response) {
                                for (var j in cResponse) {
                                    if (response[i].collectionId == cResponse[j].id) {
                                        response[i].project = cResponse[j].name;
                                    }
                                }
                            }
                            response.sort(function(a,b){return Ajax.order(a,b);});
                            result.pageData = response;
                            $rootScope.$apply();
                        })
                    });
                },
                remove: function(id) {
                    pm.indexedDB.deleteCollectionRequest(id, function(response) {
                        result.search(result.condition);
                    });
                },
                getCondition: function(stateParams) {
                    var d = [],
                        d1 = {
                            key: 'collectionId',
                            type: 'select',
                            title: '所属项目',
                            data: []
                        },
                        d2 = {
                            key: 'name',
                            type: 'text',
                            title: '项目名称'
                        };
                    pm.indexedDB.getCollections(function(response) {
                        for (var i in response) {
                            if (response[i].id == stateParams.collectionId) {
                                d1.value = response[i].id;
                            }
                        }
                        d1.data = response;
                        d.push(d1);
                        d.push(d2);
                        result.conditionItems = d;
                        $rootScope.$apply();
                    })
                },
                export: function() {
                    var id = Storage.get('collectionId');
                    if(!id){
                        errorService.showToast('不能上传，未选择项目');
                        return;
                    }
                    pm.indexedDB.getCollection(id, function(response) {
                        pm.indexedDB.getAllRequestsInCollection({
                            collectionId: id
                        }, function(rResponse) {
                            rResponse.sort(Ajax.order);
                            response.requests = rResponse;

                            // document.write((JSON.stringify(response)))

                            //保存数据到服务端
                            Ajax.post({
                                url: CONFIG.HOST_API + CONFIG.API_COLLECTION_SYNC,
                                data: 'id=' + response.remoteId + '&data=' + encodeURIComponent(JSON.stringify(response)),
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                                }
                            }, function(aResponse) {
                                if (aResponse.code != 0) {
                                    errorService.showAlert(aResponse.message);
                                }
                                errorService.showToast('上传成功！');
                                response.remoteId = aResponse.body.id;
                                delete response.requests;
                                pm.indexedDB.saveCollection(response, function(cResponse) {});
                            })
                        })
                    })
                },
                /**
                 * 快速保存，更新某接口的某个字段的值
                 */
                quickSave: function(id, key, value){
                    pm.indexedDB.getCollectionRequest(id, function(response) {
                        response[key] = value;
                        pm.indexedDB.saveCollectionRequest(response, function(rResponse) {
                            console.log('update request '+id+' success');
                        });
                    });
                },
                /**
                 * 复制接口
                 */
                copy: function(id){
                    pm.indexedDB.getCollectionRequest(id, function(response) {
                        delete response.id;
                        response.name = '[copy]' + response.name;
                        pm.indexedDB.saveCollectionRequest(response, function(rResponse) {
                            console.log('copy request '+id+' success');
                            result.pageData.push(rResponse);
                            $rootScope.$apply();
                        });
                    });
                }
            };

            return angular.extend(result, Ajax);
        }])
})
