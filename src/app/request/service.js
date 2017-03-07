/**
 * 接口服务模块
 */
define(function(require) {
    require('angular');
    require('../base/service-api');
    require('../base/service-ajax');

    angular.module('requestService', ['apiService'])
        .factory('Request', ['$rootScope', '$location', 'Ajax', 'CONFIG', 'Storage', 'ErrorService', 'pm', function($rootScope, $location, Ajax, CONFIG, Storage, ErrorService, pm) {
            var result = {
                title: '接口管理',
                collectionId: null, //项目编号
                groups: null, //表单数据
                pageData: null, //分页数据
                condition: null, //当前搜索条件
                conditionItems: null, //搜索条件项
                showSource: false,
                response: null,
                responseFields: null, //响应正文的json字段
                query: function(id) {
                    pm.DB.getCollectionRequest(id, function(response) {
                        var data = response.toForm();
                        pm.DB.getCollections(function(cResponse) {
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
                            result.originData = JSON.stringify(response, null, '\r\n');
                            $rootScope.$apply();
                        })
                    });
                },
                save: function(callback) {
                    var data = Ajax.formatData(result.groups);
                    //保存最后一次提交接口的项目编号，以便下次快速添加
                    Storage.set('collectionId', data.collectionId);
                    pm.DB.saveCollectionRequest(data, function(response) {
                        $location.path('requests/' + data.collectionId);
                        $rootScope.$apply();
                    });
                },
                search: function(data) {
                    if (!data) {
                        data = Ajax.formatCondition(result.conditionItems);
                    }
                    if (!data.collectionId) {
                        //当前搜索条件若没有项目编号则获取本地存储的
                        data.collectionId = Storage.get('collectionId');
                    }
                    result.collectionId = data.collectionId;
                    pm.DB.getAllRequestsInCollection(data, function(response) {
                        pm.DB.getCollections(function(cResponse) {
                            for (var i in response) {
                                for (var j in cResponse) {
                                    if (response[i].collectionId == cResponse[j].id) {
                                        response[i].project = cResponse[j].name;
                                    }
                                }
                            }
                            response.sort(function(a, b) {
                                return Ajax.order(a, b);
                            });
                            result.pageData = response;
                            $rootScope.$apply();
                        })
                    });
                },
                remove: function(id) {
                    pm.DB.deleteCollectionRequest(id, function(response) {
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
                    pm.DB.getCollections(function(response) {
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
                    if (!id) {
                        ErrorService.showToast('不能上传，未选择项目');
                        return;
                    }
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
                /**
                 * 快速保存，更新某接口的某个字段的值
                 */
                quickSave: function(id, key, value) {
                    pm.DB.getCollectionRequest(id, function(response) {
                        response[key] = value;
                        pm.DB.saveCollectionRequest(response, function(rResponse) {
                            console.log('update request ' + id + ' success');
                        });
                    });
                },
                /**
                 * 复制接口
                 */
                copy: function(id) {
                    pm.DB.getCollectionRequest(id, function(response) {
                        delete response.id;
                        response.name = '[copy]' + response.name;
                        pm.DB.saveCollectionRequest(response, function(rResponse) {
                            console.log('copy request ' + id + ' success');

                            var idx = -1;
                            for(var i = 0; i < result.pageData.length; i++){
                                if(result.pageData[i].id == id){
                                    console.log(i)
                                    idx = i;
                                }
                            }
                            if(idx != -1){
                                result.pageData.splice(idx + 1, 0, rResponse);
                            }
                            $rootScope.$apply();
                        });
                    });
                },
                /**
                 * 切换显示方式，源码or格式化
                 * @param group 响应参数
                 * @return
                 */
                change: function(group) {
                    if (group.fields.length < 2) {
                        return;
                    }

                    // group.fields[1].value是响应字段的参数列表

                    try {

                        if (!group.showSource) {
                            group.source = JSON.stringify(group.fields[1].value, null, '    ');
                        } else {
                            group.fields[1].value = JSON.parse(group.source);
                        }
                    } catch (e) {
                        ErrorService.showToast('处理JSON错误！');
                        return;
                    }

                    group.showSource = !group.showSource;
                },
                /**
                 * 从响应正文生成接口的响应文档并保存
                 * @param  {[type]} id [description]
                 * @return {[type]}    [description]
                 */
                saveFromResponseJson: function() {
                    var json = {},
                        responses = [];

                    try {
                        json = JSON.parse(result.responseFields);
                    } catch (e) {
                        console.log(e.message);
                        return
                    }

                    if ('body' in json) {
                        // 如果存在body则使用该字段
                        json = json.body;
                        if ('content' in json) {
                            // 如果存在content则使用该字段
                            json = json.content;
                        }
                    }

                    var data = Ajax.formatData(result.groups);
                    data.responses = result._getFieldsFromJson(json);
                    console.log(data);
                    // return;

                    pm.DB.saveCollectionRequest(data, function(response) {
                        $location.path('requests/' + data.collectionId);
                        // $rootScope.$apply();
                    });
                },
                /**
                 * 从json中取得接口的字段
                 * @param json json数据
                 * @return
                 */
                _getFieldsFromJson(json) {
                    var responses = [];

                    if (!json) {
                        return responses;
                    }

                    if (Array.isArray(json)) {
                        if (json.length == 0) {
                            return responses;
                        }

                        json = json[0];
                    }

                    for (var i in json) {
                        var d = {},
                            item = json[i];
                        d.key = i;
                        d.desc = i;
                        // object(对象or数组)
                        // 字符串
                        // 数值
                        // 布尔
                        // 其它
                        switch (typeof item) {
                            case 'object':
                                {
                                    if (Array.isArray(item)) {
                                        if (item.length > 0) {
                                            d.type = 'array';
                                            d.children = this._getFieldsFromJson(item[0]);
                                        }
                                    } else {
                                        d.type = 'object';
                                        d.children = this._getFieldsFromJson(item);
                                    }
                                    break;
                                }
                            case 'string':
                                {
                                    d.type = 'string';
                                    break;
                                }
                            case 'number':
                                {
                                    d.type = 'number';
                                    break;
                                }
                            case 'boolean':
                                {
                                    d.type = 'enum';
                                    break;
                                }
                        }
                        responses.push(d);
                    }
                    return responses;
                },
                formatFields() {
                    result.responseFields = JSON.stringify(result.responseFields, null, '\r\n');
                }
            };

            return angular.extend(result, Ajax);
        }])
})
