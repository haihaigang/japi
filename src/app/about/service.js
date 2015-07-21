/**
 * 关于我们服务模块
 */
define(function(require) {
    require('angular');
    require('../base/service-ajax');

    angular.module('aboutService', ['ajaxService'])
        .factory('About', ['$rootScope', '$location', 'Ajax', 'CONFIG', function($rootScope, $location, Ajax, CONFIG) {
            var result = {
                message: null,//导入提示信息
                importFromPM: function(files) {
                    if (!files || !files.length || files.length == 0 || files[0].type != 'application/json') {
                        result.message = '导入失败，文件不正确（未选择文件或文件格式不正确）。';
                        $rootScope.$apply();
                        return false;
                    }

                    var reader = new FileReader();
                    reader.onload = function(res) {
                        var data = JSON.parse(this.result);
                        if (!data.id || !data.requests) {
                            result.message = '导入失败，文件内容不正确。';
                            $rootScope.$apply();
                            return false;
                        }

                        var col = new Collection();
                        col.setId(data.id);
                        col.setName(data.name);
                        col.setDesc(data.description);
                        col.setVersion(data.version);
                        pm.indexedDB.saveCollection(col, function(collection) {
                            for (var i in data.requests) {
                                var d = data.requests[i],
                                    req = new CollectionRequest();
                                req.setCollectionId(collection.id);
                                req.setProject(collection.name);
                                req.setId(d.id);
                                req.setName(d.name);
                                req.setUrl(d.url);
                                req.setDesc(d.description);
                                req.setMethod(d.method);
                                req.setDataMode(d.dataMode);

                                pm.indexedDB.saveCollectionRequest(req);
                            }
                        });
                        result.message = '导入成功，共计'+data.requests.length+'个接口';
                        $rootScope.$apply();
                    }
                    reader.readAsText(files[0]);
                }
            };

            return angular.extend(result, Ajax);
        }])
})
