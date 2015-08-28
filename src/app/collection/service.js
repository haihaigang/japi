/**
 * 项目服务模块
 */
define(function(require) {
    require('angular');
    require('requester');
    require('../base/service-ajax');

    angular.module('collectionService', ['ajaxService'])
        .factory('Collection', ['$rootScope', '$location', 'Ajax', 'CONFIG', 'errorService', 'Storage', function($rootScope, $location, Ajax, CONFIG, errorService, Storage) {
            var result = {
                title: '项目管理',
                groups: null, //表单数据
                pageData: null, //分页数据
                condition: null, //搜索条件
                data: null, //某项目数据（含接口）
                navs: null,
                query: function(id) {
                    pm.indexedDB.getCollection(id, function(response) {
                        result.groups = response.toForm();
                        $rootScope.$apply(); //为什么这里不能添加$apply，必须加上，以便立即更新视图
                    });
                },
                save: function(callback) {
                    var data = Ajax.formatData(result.groups);
                    data.remoteId = 48;
                    pm.indexedDB.saveCollection(data, function(response) {
                        $location.path('collections');
                        $rootScope.$apply();
                    });
                },
                search: function(data) {
                    result.condition = data;
                    pm.indexedDB.getCollections(function(response) {
                        result.pageData = response;
                        $rootScope.$apply();
                    });
                },
                remove: function(id) {
                    pm.indexedDB.deleteCollection(id, function(response) {
                        result.search(result.condition);
                    });
                },
                export: function(id) {
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
                                response.remoteId = aResponse.body;
                                delete response.requests;
                                pm.indexedDB.saveCollection(response, function(cResponse) {});
                            })
                        })
                    })
                },
                //导出PM用的数据
                exportToPM: function(id) {
                    pm.indexedDB.getCollection(id, function(response) {
                        pm.indexedDB.getAllRequestsInCollection({
                            collectionId: id
                        }, function(rResponse) {
                            rResponse.sort(Ajax.order);
                            for(var i in rResponse){
                                var query = '';
                                for(var j in rResponse[i].data){
                                    //转换成pm的type
                                    rResponse[i].data[j].type = 'text';
                                    if(rResponse[i].data[j].key){
                                        query += '&'+rResponse[i].data[j].key + '=' + rResponse[i].data[j].value;
                                    }
                                }
                                rResponse[i].url = response.host + rResponse[i].url;
                                if(rResponse[i].method == 'GET'){
                                    query = query.replace('&','?');
                                    rResponse[i].url += query;
                                }
                                rResponse[i].dataMode = 'params';
                                rResponse[i].description = rResponse[i].desc;
                                rResponse[i].version = 2;//pm中该参数必须
                                rResponse[i].responses = [];
                                rResponse[i].headers = "";
                            }
                            response.requests = rResponse;

                            document.write((JSON.stringify(response)))
                            
                        })
                    })
                },
                /**
                 * 预览接口，根据传入id长度获取不同状态数据，长度小于32位从服务端获取否则从本地获取
                 */
                preview: function(id) {
                    if (id.length < 32) {
                        // if(Storage.get('jdata')){
                        //     result.data = Storage.get('jdata');
                        //     return;
                        // }
                        Ajax.get({
                            url: CONFIG.HOST_API + CONFIG.API_COLLECTION_SYNC,
                            data: {
                                id: id
                            }
                        }, function(response) {
                            if (response.code != 0) {
                                errorService.showAlert(response.message);
                            }
                            result.processData(response.body);
                            result.data = response.body;
                            Storage.set('jdata',response.body);
                        })
                    } else {
                        pm.indexedDB.getCollection(id, function(response) {
                            pm.indexedDB.getAllRequestsInCollection({
                                collectionId: id
                            }, function(rResponse) {
                                response.requests = rResponse;
                                result.processData(response);
                                result.data = response;
                            })
                        })
                    }
                },
                /**
                 * 处理预览的数据，排序、分组、移除空值、添加提醒颜色
                 * @return {[type]} [description]
                 */
                processData: function(data){
                    var arr = [];
                    var lastIdx = -1;

                    data.requests.sort(Ajax.order);

                    for(var i in data.requests){
                        var s = data.requests[i].url;
                        var a = s.split('/');
                        var first = true;
                        var colors = ['red','blue','green','aquamarine','violet','purple','orange'];
                        
                        for(var j in arr){
                            if(a[0] == arr[j].module){
                                first = false;
                                break;
                            }
                        }

                        //移除最后一个的空值
                        if(!data.requests[i].data[data.requests[i].data.length - 1].key){
                            data.requests[i].data.pop();
                        }
                        if(!data.requests[i].responses[data.requests[i].responses.length - 1].key){
                            data.requests[i].responses.pop();
                        }

                        if(first){
                            var code = 0;
                            for(var k = 0; k < a[0].length; k++){
                                code += a[0].charCodeAt(k);
                            }
                            lastIdx++;
                            arr.push({
                                module: a[0],
                                moduleColor: colors[code % colors.length],
                                originId: i,
                                sub: []
                            });
                        }

                        if(lastIdx>-1){
                            data.requests[i].originId = parseInt(i);
                            arr[lastIdx].sub.push(data.requests[i]);
                        }
                    }
                    data.requests = arr;
                    return arr;
                }
            };

            return angular.extend(result, Ajax);
        }])
})
