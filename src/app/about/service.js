/**
 * 关于我们服务模块
 */
define(function(require) {
    require('angular');
    require('requester');
    require('../base/service-ajax');

    var pm = require('../model/pm'),
        Collection = require('../model/collection'),
        CollectionRequest = require('../model/collection-request');

    angular.module('aboutService', ['ajaxService'])
        .factory('About', ['$rootScope', '$location', 'Ajax', 'CONFIG', function($rootScope, $location, Ajax, CONFIG) {
            var result = {
                title: '关于',
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
                importFromPmService: function(url) {
                    var url = $('#import-url').val();
                    if (!url || !/^http(s)?:\/\/.*$/.test(url)) {
                        result.message = '导入失败，输入的url不是有效的。';
                        result.status = 'error';
                        // $rootScope.$apply();
                        return false;
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
                }
            };

            return angular.extend(result, Ajax);
        }])
})
