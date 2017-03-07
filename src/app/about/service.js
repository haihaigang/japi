/**
 * 关于我们服务模块
 */
define(function(require) {
    require('angular');
    require('../base/service-ajax');

    var a = 1,
        //pm = require('../model/pm'),
        Collection = require('../model/collection'),
        CollectionRequest = require('../model/collection-request');

    angular.module('aboutService', ['ajaxService'])
        .factory('About', ['$rootScope', '$location', 'Ajax', 'CONFIG','pm', function($rootScope, $location, Ajax, CONFIG,pm) {
            var result = {
                title: '关于',
                url: null,//导入的地址
                collectionId: null, //导入数据对应的collection
                jsonData: null,//接口的json数据
                status: false, //错误标志，success、error
                message: null, //导入提示信息
                importFromPmFile: function(files) {
                    //有的文件类型读取为空
                    if (!files || !files.length || files.length == 0) {
                        result.message = '导入失败，文件不正确（未选择文件或文件格式不正确）。';
                        result.status = 'error';
                        $rootScope.$apply();
                        return false;
                    }

                    var reader = new FileReader();
                    reader.onload = function(res) {
                        result.importData(res.srcElement.result);
                    };
                    reader.readAsText(files[0]);
                },
                importFromPmService: function() {
                    // if (!result.url || !/^http(s)?:\/\/.*$/.test(result.url)) {
                    //     result.message = '导入失败，输入的url不是有效的。';
                    //     result.status = 'error';
                    //     return false;
                    // }

                    var url = result.url;

                    //输入的可以是绝对的地址或者ID
                    if(!isNaN(result.url)){
                        url = '/webapi.php?api=399&id=' + result.url;
                    }

                    Ajax.get({
                        url: url, //'http://zcbdev.worldunion.com.cn:8282/wu-asset-appinterface/api/account/sendAuthCode?jsonData={mobiletel:18066722251}',
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    }, function(response) {
                        if (response.code != 0) {
                            result.message = '获取接口数据错误' + response.message;
                            result.status = 'error';
                            $rootScope.$apply();
                            return false;
                        }
                        result.importData(response.body);
                    });
                },
                importData: function(data) {
                    //若data为string，先尝试解析json
                    if (typeof data == 'string') {
                        try {
                            data = JSON.parse(data);
                        } catch (e) {
                            result.message = '尝试解析json错误 ' + e.message;
                            result.status = 'error';
                            $rootScope.$apply();
                            return false;
                        }
                    }

                    if (!data || !data.id || !data.requests) {
                        result.message = '导入失败，文件内容不正确。';
                        result.status = 'error';
                        $rootScope.$apply();
                        return false;
                    }

                    var col = new Collection(data);
                    pm.DB.saveCollection(col, function(collection) {
                        for (var i in data.requests) {
                            for (var j in data.requests[i].data) {
                                //转换pm的数据，字段类型统一为string
                                if (data.requests[i].data[j].type == 'file') {
                                    // data.requests[i].data[j].type = 'string';
                                }
                            }
                            var d = data.requests[i],
                                req = new CollectionRequest(data.requests[i]);

                            pm.DB.saveCollectionRequest(req);
                        }
                    });
                    result.message = '导入成功，共计' + data.requests.length + '个接口';
                    result.status = 'success';
                    // $rootScope.$apply();
                },
                importRequestFromJson: function() {
                    if (!result.jsonData || typeof result.jsonData != 'string') {
                        result.message = '导入失败，参数错误';
                        result.status = 'error';
                        return false;
                    }

                    var data = undefined;

                    try {
                        data = JSON.parse(result.jsonData);
                        //TODO 校验数据中的一些关键值是否存在，eg:id、collectionId
                    } catch (e) {
                        result.message = '尝试解析json错误 ' + e.message;
                        result.status = 'error';
                        return false;
                    }

                    var d = data,
                        req = new CollectionRequest(data);

                    pm.DB.saveCollectionRequest(req,function(){
                        result.message = '导入接口数据成功';
                        result.status = 'success';
                    });
                },
                convertToC: function() {
                    pm.indexedDB.getAllRequestsInCollection({
                        collectionId: 'dad36cce-ed80-0558-79f0-f833bcadc6fe'
                    }, function(response) {
                        var length = response.length;
                        for (var i = 0; i < length; i++) {
                            var len = response[i].responses.length;
                            for (var j = 0; j < len; j++) {
                                var detail = response[i].responses[j].detail;
                                if (!detail) {
                                    continue;
                                }
                                try {
                                    detail = JSON.parse(detail);
                                    var children = [];
                                    children = result.test(detail);
                                    response[i].responses[j].children = children;
                                    delete(response[i].responses[j].detail);
                                } catch (e) {
                                    console.log(response[i].url);
                                }
                            }

                            pm.indexedDB.saveCollectionRequest(response[i],function(data){
                                //console.log('success save ' + data.id)
                            });
                        }
                    })
                },
                generateMockApi: function() {
                    var id = result.id;

                    Ajax.post({
                        url: '/webapi.php?api=309',
                        data: {
                            id: id
                        }
                    }, function(response) {
                        if (response.code != 0) {
                            result.message = '生成失败！' + response.message;
                            result.status = 'error';
                            $rootScope.$apply();
                            return false;
                        }

                        result.message = '生成成功！';
                        result.status = 'success';
                        // $rootScope.$apply();
                    });
                }
            };

            return angular.extend(result, Ajax);
        }])
})
