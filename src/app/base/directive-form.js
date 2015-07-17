/**
 * 表单指令
 * 包含以下指令：
 * 1 多文件上传
 * 2 文件上传
 * 3 日期控件
 * 4 级联下拉框
 */
define(function(require) {
    require('angular');

    var module = angular.module('formDirective', []);

    /**
     * 多文件上传指令
     * <div j-uploader="data/upload.json" j-img="user.value"></div>
     */
    module.directive('jUploader', ['uploaderFactory', '$log', function(uploaderFactory, $log) {
        return {
            data: uploaderFactory.data,
            restrict: 'AEC',
            // template:'<div class="panel panel-info"><div class="panel-heading"><input class="btn btn-default" type="file" name="{{file.parameter}}" multiple/></div><div class="panel-body"><div ng-repeat="file in fileList"  style="text-align:center;" class="bg-primary"><span>{{file.filename}}</span><button ng-click="erase(this)" type="button" class="close" aria-hidden="true">&times;</button><div class="progress"><div min-width="10%" class="progress-bar" role="progressbar" aria-valuenow="{{file.value}}" aria-valuemin="0" aria-valuemax="100" style="width: {{file.value}}%;">{{file.size}}/{{file.total}}</div></div></div><button class="btn btn-success" type="button" ng-click="startUpload(event)">Upload</button></div></div>',
            templateUrl: 'app/base/view/form-uploader.html',
            link: function($scope, element, attrs) {
                $scope.wtf;
                $scope.fileList = [];
                $scope.concurrency = (typeof attrs.concurrency == "undefined") ? 2 : attrs.concurrency;
                $scope.concurrency = parseInt($scope.concurrency);
                $scope.parameter = (typeof attrs.name == "undefined") ? "file" : attrs.name;
                $scope.activeUploads = 0;
                $scope.getSize = function(bytes) {
                    var sizes = ['n/a', 'bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EiB', 'ZiB', 'YiB'];
                    var i = +Math.floor(Math.log(bytes) / Math.log(1024));
                    return (bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + sizes[isNaN(bytes) ? 0 : i + 1];
                }

                element.find("input").bind("change", function(e) {
                    var files = e.target.files;
                    for (var i = 0; i < files.length; i++) {
                        $scope.fileList.push({
                            parameter: $scope.parameter,
                            active: false,
                            filename: files[i].name,
                            file: files[i],
                            value: (0 / files[i].size) * 100,
                            size: 0,
                            total: $scope.getSize(files[i].size)
                        });

                    }
                    $scope.$apply();
                    //$scope.startUpload();
                });
                $scope.erase = function(ele) {
                    $log.info("file erased=");
                    $scope.fileList.splice($scope.fileList.indexOf(ele), 1);
                };
                $scope.onProgress = function(upload, loaded) {
                    $log.info("progress=" + loaded);
                    upload.value = (loaded / upload.file.size) * 100;
                    upload.size = $scope.getSize(loaded);
                    $scope.$apply();
                };

                $scope.onCompleted = function(upload) {
                    $log.info("file uploaded=" + upload.filename);
                    $scope.activeUploads -= 1;
                    $scope.fileList.splice($scope.fileList.indexOf(upload), 1);
                    $scope.$apply();
                    $scope.startUpload();
                }
                $scope.onStartUpload = function() {

                }
                $scope.startUpload = function(e) {
                    $log.info("URL=" + attrs.ngUploader);
                    //$log.info("Init Upload");

                    // $scope.concurrency=($scope.concurrency==undefined)?2:$scope.concurrency;
                    for (var i in $scope.fileList) {
                        if ($scope.activeUploads == $scope.concurrency) {
                            break;
                        }

                        if ($scope.fileList[i].active)
                            continue;
                        $scope.ajaxUpload($scope.fileList[i]);

                    }
                    $scope.onStartUpload();
                    return false;
                };

                $scope.ajaxUpload = function(upload) {

                    var xhr, formData, prop, data = "",
                        key = "" || 'file',
                        index;
                    //index = upload.count;
                    console.log('Beging upload: ' + upload.filename);
                    $scope.activeUploads += 1;
                    upload.active = true;
                    xhr = new window.XMLHttpRequest();
                    formData = new window.FormData();
                    xhr.open('GET', attrs.ngUploader);

                    // Triggered when upload starts:
                    xhr.upload.onloadstart = function() {
                        // File size is not reported during start!
                        console.log('Upload started: ' + upload.filename);
                        //methods.OnStart(upload.newname);
                    };

                    // Triggered many times during upload:
                    xhr.upload.onprogress = function(event) {
                        // console.dir(event);
                        if (!event.lengthComputable) {
                            return;
                        }

                        // Update file size because it might be bigger than reported by
                        // the fileSize:
                        console.log("File: " + upload.filename);
                        //methods.OnProgress(xhr,event.total, event.loaded, index, upload.newname,upload);
                        $scope.onProgress(upload, event.loaded);
                    };

                    // Triggered when upload is completed:
                    xhr.onload = function(event) {
                        console.log('Upload completed: ' + upload.filename);
                        console.log(xhr.response)
                        $scope.onCompleted(upload);

                    };

                    // Triggered when upload fails:
                    xhr.onerror = function() {
                        console.log('Upload failed: ', upload.filename);
                    };

                    // Append additional data if provided:
                    if (data) {
                        for (prop in data) {
                            if (data.hasOwnProperty(prop)) {
                                console.log('Adding data: ' + prop + ' = ' + data[prop]);
                                formData.append(prop, data[prop]);
                            }
                        }
                    }

                    // Append file data:
                    formData.append(key, upload.file, upload.parameter);

                    // Initiate upload:
                    xhr.send(formData);

                    return xhr;
                };
            }
        };
    }]).factory('uploaderFactory', function() {
        return {
            data: 4454,
            startUpload: function() {
                alert("funcaaa");
            }
        };
    });

    /**
     * 文件上传指令
     * <div j-file="data/upload.json" j-img="item.value" j-max="integer"></div>
     * @param jImg 文件，可以为数组或字符串
     * @param jMax 最大数量，-1表示不限制数量
     */
    module.directive('jFile', ['$log', 'CONFIG', function($log, CONFIG) {
        return {
            restrict: 'AEC',
            templateUrl: 'app/base/view/form-file.html',
            scope: {
                value: '=jImg'
            },
            link: function($scope, element, attrs) {
                $scope.items = [];
                $scope.showAdd = true;
                attrs.jFile = attrs.jFile || CONFIG.HOST_API + CONFIG.API_GLOBAL_UPLOAD;
                attrs.jMax = attrs.jMax || 1;

                //初始化
                if ($scope.value) {
                    if (typeof $scope.value == 'object' && $scope.value.length > 0) {
                        for (var i in $scope.value) {
                            $scope.items.push({
                                active: false,
                                url: $scope.value[i]
                            });
                        }
                    } else if (typeof $scope.value == 'string') {
                        $scope.items.push({
                            active: false,
                            url: $scope.value
                        });
                    }
                } else {
                    $scope.items.push({
                        active: false,
                        url: CONFIG.DEF_URL_IMG
                    });
                }

                //当最大数量小于等于1的时候，默认不显示添加按钮
                if(attrs.jMax != -1 && attrs.jMax <= 1){
                    $scope.showAdd = false;
                }

                $scope.getSize = function(bytes) {
                    var sizes = ['n/a', 'bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EiB', 'ZiB', 'YiB'];
                    var i = +Math.floor(Math.log(bytes) / Math.log(1024));
                    return (bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + sizes[isNaN(bytes) ? 0 : i + 1];
                }

                element.on('change', 'input', function(e) {
                    var files = e.target.files,
                        idx = $(this).attr('idx');
                    $scope.startUpload(files, idx);
                });

                element.on('mouseover', '.form-image-item', function(){
                    $(this).find('.remove').show();
                }).on('mouseout','.form-image-item',function(){
                    $(this).find('.remove').hide();
                })

                $scope.change = function(e, idx) {
                    console.log(idx);
                    $scope.startUpload(e.target.files, idx);
                }

                $scope.add = function() {
                    $scope.items.push({
                        active: false,
                        url: CONFIG.def_url_img
                    });

                    if(attrs.jMax != -1 && $scope.items.length >= attrs.jMax){
                        $scope.showAdd = false;
                    }
                }

                $scope.remove = function(idx) {
                    if($scope.items.length <= 1){
                    // return;
                    }
                    $scope.items.splice(idx, 1);
                    $scope.showAdd = true;
                }

                $scope.startUpload = function(files, idx) {
                    $log.info("URL=" + attrs.jFile);

                    if (files.length == 0) {
                        return;
                    }

                    if (!idx || $scope.items[idx].active) {
                        return;
                    }

                    $scope.items[idx].active = true;
                    $scope.msg = '';
                    $scope.ajaxUpload(files[0], idx);
                    return false;
                };

                $scope.ajaxUpload = function(upload, idx) {

                    var xhr, formData, prop, data = "",
                        key = "" || 'file',
                        index;
                    //index = upload.count;
                    console.log('Beging upload: ' + upload.name);
                    xhr = new window.XMLHttpRequest();
                    formData = new window.FormData();
                    xhr.open('POST', attrs.jFile);

                    xhr.upload.onloadstart = function() {
                        console.log('Upload started: ' + upload.name);
                    };

                    xhr.upload.onprogress = function(event) {
                        if (!event.lengthComputable) {
                            return;
                        }

                        var loaded = event.loaded;

                        $log.info("progress=" + loaded);
                        upload.value = (loaded / upload.size) * 100;
                        upload.size = $scope.getSize(loaded);
                        $scope.$apply();
                    };

                    xhr.onload = function(event) {
                        $log.info('completed: ' + upload.name);

                        $scope.items[idx].active = false;
                        if (xhr.status == 200) {
                            var data = JSON.parse(xhr.response);
                            if (data.code != 0) {
                                $scope.msg = data.message;
                            } else {
                                $scope.items[idx].url = data.body;
                            }
                        } else {
                            $scope.msg = xhr.statusText;
                        }
                        $scope.$apply();
                    };

                    xhr.onerror = function() {
                        $scope.msg = '上传失败';
                        console.log('Upload failed: ', upload.name);
                    };

                    if (data) {
                        for (prop in data) {
                            if (data.hasOwnProperty(prop)) {
                                console.log('Adding data: ' + prop + ' = ' + data[prop]);
                                formData.append(prop, data[prop]);
                            }
                        }
                    }

                    formData.append(key, upload.file, upload.parameter);

                    xhr.send(formData);

                    return xhr;
                };
            }
        };
    }]);

    /**
     * 日期控件指令，依赖于bootstrap-datetimepicker
     * <input j-date ng-model="some" options="some" select="dosome">
     */
    module.directive('jDate', ['$log', function($log) {
        return {
            restrict: 'A',
            require: '?ngModel',
            // scope: {
            //     select: '&',
            //     options: '=',
            //     end: '@'
            // },
            scope: true,
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return;

                $.fn.datetimepicker.dates['zh-CN'] = {
                    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
                    daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
                    daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
                    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                    monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                    today: "今天",
                    suffix: [],
                    meridiem: ["上午", "下午"]
                };

                var optionsObj = {
                    format: 'yyyy-mm-dd',
                    weekStart: 0,
                    startDate: null,
                    endDate: null,
                    daysOfWeekDisabled: [],
                    autoclose: true,
                    startView: 2,
                    minView: 2,
                    maxView: 4,
                    todayBtn: false,
                    todayHighlight: false,
                    keyboardNavigation: true,
                    language: 'zh-CN',
                    forceParse: true,
                    minuteStep: 5,
                    pickerPosition: 'bottom-right'
                };

                if (attrs.options) {
                    for (var i in optionsObj) {
                        optionsObj[i] = attrs.options[i] || optionsObj[i];
                    }
                }

                scope.$watch(attrs.end, function(newVal) {
                    if (newVal) {
                        element.datetimepicker('setEndDate', newVal);
                    }
                });

                scope.$watch(attrs.start, function(newVal) {
                    if (newVal) {
                        element.datetimepicker('setStartDate', newVal);
                    }
                });

                var updateModel = function(dateTxt) {
                    scope.$apply(function() {
                        // Call the internal AngularJS helper to
                        // update the two way binding
                        console.log(dateTxt);
                        ngModel.$setViewValue(dateTxt);
                    });
                };

                ngModel.$render = function() {
                    console.log(ngModel.$viewValue);
                    // Use the AngularJS internal 'binding-specific' variable
                    element.datetimepicker('setDate', ngModel.$viewValue || '');
                };

                element.datetimepicker(optionsObj).on('changeDate', function(e) {
                    if (scope.select) {
                        scope.$apply(function() {
                            scope.select({
                                date: e
                            });
                        });
                    }
                });
            }
        };
    }]);

    /**
     * 级联下拉框指令
     * <div j-region options="some func" selects="some data"></div>
     */
    module.directive('jRegion', ['$log', '$http', 'CONFIG', function($log, $http, CONFIG) {
        return {
            restrict: 'A',
            templateUrl: 'app/base/view/form-region.html',
            replace: true,
            scope: {
                options: '&',
                selects: '='
            },
            link: function($scope, element, attrs) {
                var len = $scope.selects.length;
                if (!$scope.selects || (len != 1 && len != 2 && len != 3 && len != 4 && len != 6)) return;

                //定义列宽，以bootstrap12列为基准，长度只能是12的公约数
                $scope.cols = 12 / len;

                //绑定change事件，加载下一个选择框的异步数据
                for (var i = 0; i < len; i++) {
                    $scope.selects[i].change = function(idx) {
                        if ((idx + 1) < len && $scope.selects[idx + 1].url) {
                            $http.get($scope.selects[idx + 1].url).success(function(data) {
                                $scope.selects[idx + 1].data = data.body;
                            })
                        }
                    }
                }

                //若需要，加载第一个下拉框的数据
                if ($scope.selects[0].url) {
                    $http.get($scope.selects[0].url).success(function(data) {
                        $scope.selects[0].data = data.body;
                    })
                }

                //因为ngmodel不会触发onchange事件，这里手工赋值
                for (var i = 0; i < len; i++) {
                    if ($scope.selects[i].value) {
                        $scope.selects[i].change(i);
                    }
                }

            }
        }
    }]);

    /**
     * 自定义多内容
     * <div j-mutiple options="some func" data="some data"></div>
     */
    module.directive('jMutiple', ['$log', '$http', 'CONFIG', function($log, $http, CONFIG) {
        return {
            restrict: 'A',
            templateUrl: 'app/base/view/form-mutiple.html',
            //replace: true,
            scope: {
                options: '&',
                data: '='
            },
            link: function($scope, element, attrs) {
                var len = $scope.data.length;

                //定义列宽，以bootstrap12列为基准，长度只能是12的公约数
                $scope.cols = 12 / len;

                $scope.remove = function(idx){
                    if($scope.data.length <=1) return;
                    $scope.data.splice(idx,1);
                }

                $scope.add = function(idx){
                    $scope.data.push({
                        name: "",
                        value: ""
                    })
                }
            }
        }
    }]);
})
