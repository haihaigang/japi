/**
 * 项目服务模块
 */
define(function(require) {
    require('angular');
    require('requester');
    require('../base/service-api');
    require('../base/service-ajax');

    // var pm = require('../model/pm');

    angular.module('collectionService', ['apiService'])
        .factory('Collection', ['$rootScope', '$location', 'Ajax', 'CONFIG', 'ErrorService', 'Storage', 'pm', function($rootScope, $location, Ajax, CONFIG, ErrorService, Storage, pm) {
            var result = {
                title: '项目管理',
                groups: null, //表单数据
                pageData: null, //分页数据
                condition: null, //搜索条件
                data: null, //某项目数据（含接口）
                navs: null,
                query: function(id) {
                    pm.DB.getCollection(id, function(response) {
                        result.groups = response.toForm();
                        //$rootScope.$apply(); //为什么这里不能添加$apply，必须加上，以便立即更新视图
                    });
                },
                save: function(callback) {
                    var data = Ajax.formatData(result.groups);
                    data.remoteId = 48;
                    pm.DB.saveCollection(data, function(response) {
                        $location.path('collections');

                        //$rootScope.$apply();
                    });
                },
                search: function(data) {
                    result.condition = data;
                    pm.DB.getCollections(function(response) {
                        console.log(response);
                        result.pageData = response;
                        console.log($rootScope)
                        // $rootScope.$apply();
                    });
                },
                remove: function(id) {
                    pm.DB.deleteCollection(id, function(response) {
                        result.search(result.condition);
                    });
                },
                export: function(id) {
                    pm.DB.getCollection(id, function(response) {
                        pm.DB.getAllRequestsInCollection({
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
                                    ErrorService.showAlert(aResponse.message);
                                }
                                ErrorService.showToast('上传成功！');
                                response.remoteId = aResponse.body.id;
                                delete response.requests;
                                pm.DB.saveCollection(response, function(cResponse) {});
                            })
                        })
                    })
                },
                //导出PM用的数据
                exportToPM: function(id) {
                    pm.DB.getCollection(id, function(response) {
                        pm.DB.getAllRequestsInCollection({
                            collectionId: id
                        }, function(rResponse) {
                            rResponse.sort(Ajax.order);
                            for (var i in rResponse) {
                                var query = '';
                                for (var j in rResponse[i].data) {
                                    //转换成pm的type
                                    rResponse[i].data[j].type = 'text';
                                    if (rResponse[i].data[j].key) {
                                        query += '&' + rResponse[i].data[j].key + '=' + rResponse[i].data[j].value;
                                    }
                                }
                                rResponse[i].url = response.host + rResponse[i].url;
                                if (rResponse[i].method == 'GET') {
                                    query = query.replace('&', '?');
                                    rResponse[i].url += query;
                                }
                                rResponse[i].dataMode = 'params';
                                rResponse[i].description = rResponse[i].desc;
                                rResponse[i].version = 2; //pm中该参数必须
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
                                ErrorService.showAlert(response.message);
                            }
                            result.processData(response.body);
                            result.data = response.body;
                            Storage.set('jdata', response.body);
                        })
                    } else {
                        pm.DB.getCollection(id, function(response) {
                            pm.DB.getAllRequestsInCollection({
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
                processData: function(data) {
                    var arr = [];
                    var lastIdx = -1;

                    data.requests.sort(Ajax.order);

                    for (var i in data.requests) {
                        var s = data.requests[i].url;
                        var a = s.split('/');
                        var first = true;
                        var colors = ['red', 'blue', 'green', 'aquamarine', 'violet', 'purple', 'orange'];

                        for (var j in arr) {
                            if (a[0] == arr[j].module) {
                                first = false;
                                break;
                            }
                        }

                        //移除最后一个的空值
                        if (!data.requests[i].data[data.requests[i].data.length - 1].key) {
                            data.requests[i].data.pop();
                        }
                        if (!data.requests[i].responses[data.requests[i].responses.length - 1].key) {
                            data.requests[i].responses.pop();
                        }

                        if (first) {
                            var code = 0;
                            for (var k = 0; k < a[0].length; k++) {
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

                        if (lastIdx > -1) {
                            data.requests[i].originId = parseInt(i);
                            arr[lastIdx].sub.push(data.requests[i]);
                        }
                    }
                    data.requests = arr;
                    return arr;
                },
                /**
                 * 展示接口，
                 * @return {[type]} [description]
                 */
                getAllRequests0: function() {
                    result.cwidth = document.documentElement.clientWidth - 30; //整体的页面两边间隙
                    result.cheight = document.documentElement.clientHeight;
                    var data = {},
                        dist = 100,
                        ai = [{
                            x: 1,
                            y: 0
                        }, {
                            x: 1,
                            y: 1
                        }, {
                            x: 0,
                            y: 1
                        }, {
                            x: -1,
                            y: 1
                        }, {
                            x: -1,
                            y: 0
                        }, {
                            x: -1,
                            y: -1
                        }, {
                            x: 0,
                            y: -1
                        }, {
                            x: 1,
                            y: -1
                        }];
                    data.collectionId = Storage.get('collectionId');
                    pm.DB.getAllRequestsInCollection(data, function(response) {
                        // response.sort(Ajax.order);
                        // for(var i = 0; i < response.length; i++){
                        //     for(var j = 0; j < response[i].responses.length; j++){
                        //         var o = response[i].responses[j];
                        //         if(o.type == 'object'){
                        //             o[o.key] = JSON.parse(o.detail);
                        //         }
                        //     }
                        // }
                        var processData = result.processData({
                            requests: response
                        });
                        for (var i in processData) {
                            for (var j in processData[i].sub) {
                                var len = processData[i].sub.length,
                                    c = 1 + Math.floor(j / 8),
                                    m = j % len,
                                    m = j % 8,
                                    o = {
                                        left: result.cwidth / 2 + ai[m].x * dist * c - 20,
                                        top: result.cheight / 2 - ai[m].y * dist * c - 20

                                        // left: result.cwidth / 2 + Math.sin(m * 360/len * Math.PI / 180) * dist - 100,
                                        // top: result.cheight / 2 - Math.cos(m * 360/len * Math.PI / 180) * dist - 20,
                                        // transform: 'rotate('+ (90 + m * 360/len )+'deg)',

                                        // left: result.cwidth / 2,
                                        // top: result.cheight / 2,
                                        // transform: 'rotate('+ (90 + m * 360/len )+'deg) translate(200px)',
                                        // 'transform-origin': '0% 50%'
                                    };
                                processData[i].sub[j].pos = o;
                            }
                        }
                        result.models = processData;

                        $rootScope.$apply();
                    });
                },
                /**
                 * 展示接口，瀑布流形式
                 * @return {[type]} [description]
                 */
                getAllRequests: function() {
                    result.cwidth = document.documentElement.clientWidth - 30; //减去整体的页面两边间隙30
                    result.cheight = document.documentElement.clientHeight;
                    var data = {},
                        dist = 200, //单元格的宽度
                        pad = 15, //单元格上下左右的间隙
                        groups = [],
                        gLen = Math.floor(result.cwidth / (dist + pad));
                    data.collectionId = Storage.get('collectionId');
                    pm.DB.getAllRequestsInCollection(data, function(response) {
                        var processData = result.processData({
                            requests: response
                        });
                        for (var i in processData) {
                            groups = [];
                            for (var j in processData[i].sub) {
                                var len = processData[i].sub.length,
                                    rLen = processData[i].sub[j].responses.length,
                                    cur = j % gLen,
                                    lowerGroup = cur,
                                    maxGroup = cur,
                                    cellHeight = (rLen < 1 ? 1 : rLen) * 41 + 38 + pad, //41＝每个字段的高，38=标题的高
                                    o = {};

                                groups[cur] = groups[cur] || pad;
                                if (groups.length >= gLen) {
                                    for (var i0 in groups) {
                                        if (groups[i0] < groups[lowerGroup]) lowerGroup = i0;
                                    }
                                }
                                o.left = (dist + pad) * lowerGroup;
                                o.top = groups[lowerGroup];
                                groups[lowerGroup] += cellHeight;
                                for (var j0 in groups) {
                                    if (groups[j0] > groups[maxGroup]) maxGroup = j0;
                                }
                                processData[i].maxHeight = groups[maxGroup];
                                processData[i].sub[j].pos = o;

                                for (var k = 0; k < rLen; k++) {
                                    var o = processData[i].sub[j].responses[k];
                                    if (o.type == 'object' || o.type == 'array'){
                                        try{
                                            processData[i].sub[j].responses[k]['detail'] = JSON.parse(o.detail);
                                        }catch(e){
                                            console.log(processData[i].sub[j].url + ' ' + o.detail);
                                            processData[i].sub[j].responses[k]['detail'] = {};
                                        }
                                    }
                                }
                            }
                        }
                        result.models = processData;

                        $rootScope.$apply();
                    });
                }
            };

            return angular.extend(result, Ajax);
        }])
})
