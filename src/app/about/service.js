/**
 * 关于我们服务模块
 */
define(function(require) {
    require('angular');
    require('../base/service-ajax');

    angular.module('aboutService', ['ajaxService'])
        .factory('About', ['$rootScope', '$location', 'Ajax', 'CONFIG', function($rootScope, $location, Ajax, CONFIG) {
            var result = {
                message: null, //导入提示信息
                importFromPmFile: function(files) {
                    //有的文件类型读取为空
                    if (!files || !files.length || files.length == 0) {
                        result.message = '导入失败，文件不正确（未选择文件或文件格式不正确）。';
                        $rootScope.$apply();
                        return false;
                    }

                    var reader = new FileReader();
                    reader.onload = function(res) {
                        var data = JSON.parse(this.result);
                        result.importData(data);
                    };
                    console.log(files);
                    reader.readAsText(files[0]);
                },
                importFromPmService: function(url) {
                    var url = $('#import-url').val();
                    if (!url || !/^http(s)?:\/\/.*$/.test(url)) {
                        result.message = '导入失败，输入的url不是有效的。';
                        $rootScope.$apply();
                        return;
                    }

                    Ajax.get({
                        url: url,//'http://zcbdev.worldunion.com.cn:8282/wu-asset-appinterface/api/account/sendAuthCode?jsonData={mobiletel:18066722251}',
                        headers:{
                            'Access-Control-Allow-Origin':'*'
                        }
                    }, function(response) {
                        result.importData(response);
                    });
                },
                importData: function(data) {
                    if (!data.id || !data.requests) {
                        result.message = '导入失败，文件内容不正确。';
                        $rootScope.$apply();
                        return false;
                    }

                    var col = new Collection(data);
                    pm.indexedDB.saveCollection(col, function(collection) {
                        for (var i in data.requests) {
                            //转换pm的数据，字段类型统一为string
                            for(var j in data.requests[i].data){
                                data.requests[i].data[j].type = 'string';
                            }
                            var d = data.requests[i],
                                req = new CollectionRequest(data.requests[i]);

                            pm.indexedDB.saveCollectionRequest(req);
                        }
                    });
                    result.message = '导入成功，共计' + data.requests.length + '个接口';
                    $rootScope.$apply();
                }
            };

            return angular.extend(result, Ajax);
        }])
})
