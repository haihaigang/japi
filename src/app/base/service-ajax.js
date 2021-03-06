/**
 * 扩展$http，添加拦截
 */
define(function(require) {
    require('angular');

    angular.module('ajaxService', [])
        .factory('Ajax', ['$http', '$rootScope', 'ErrorService', function($http, $rootScope, ErrorService) {
            var ajax = {
                breadcrumbs: []
            };

            var extendHeaders = function(config) {
                config.headers = config.headers || {};
                // config.headers['Access-Control-Allow-Origin'] = '*';
            }

            angular.forEach(['get', 'delete', 'head', 'jsonp'], function(name) {
                ajax[name] = function(options, callback, callbackError) {
                    if (!options.isSilent) {
                        ErrorService.showLoading();
                    }

                    extendHeaders(options);

                    $http({
                            url: options.url,
                            method: name,
                            params: options.data,
                            headers: options.headers,
                            cache: false
                        })
                        .then(function(response) {
                            var data = response.data;
                            ErrorService.hideLoading();
                            // if (data.code != 0) {
                            //     $rootScope.errorMsg = data.message || '获取数据失败';
                            //     return;
                            // }
                            callback && callback(data);
                        }, function(response) {
                            ErrorService.hideLoading();
                            callbackError && callbackError(response);
                        });
                }
            });

            angular.forEach(['post', 'put'], function(name) {
                ajax[name] = function(options, callback, callbackError) {
                    if (!options.isSilent) {
                        ErrorService.showLoading();
                    }

                    extendHeaders(options);

                    $http({
                            url: options.url,
                            method: name,
                            data: options.data,
                            headers: options.headers,
                            cache: false
                        })
                        .then(function(response) {
                            ErrorService.hideLoading();
                            var data = response.data;
                            if (data.code != 0) {
                                $rootScope.errorMsg = data.message || '获取数据失败';
                                return;
                            }
                            callback && callback(data);
                        }, function(response) {
                            ErrorService.hideLoading();
                            callbackError && callbackError(response);
                        })
                }
            });

            //设置什么的
            ajax.init = function(state) {
                this.breadcrumbs = [{
                    name: '首页',
                    url: 'home'
                }];
                if (state.current.name.indexOf('.') != -1) {
                    //当前若是继承的视图，需要两级导航，1父级的视图状态，2当前的操作名称（优先视图数据中获取，若没有则默认）
                    this.breadcrumbs.push({
                        name: this.title,
                        url: state.$current.path[0].self.name
                    });
                    var opt = state.params.id ? '编辑' : '新增';
                    if (state.current.data && state.current.data.title) {
                        opt = state.current.data.title;
                    }
                    this.breadcrumbs.push({
                        name: opt,
                        active: 'active'
                    });
                } else {
                    this.breadcrumbs.push({
                        name: this.title,
                        url: state.current.name
                    });

                }
                return this.breadcrumbs;
            };

            /**
             * 转换自定义表单对象为普通对象
             * {"id":"",data:[{"name":"",data:[{}]},{...}]} => {"id":"","name":""...}
             * @param  {[type]} data [description]
             * @return {[type]}      [description]
             */
            ajax.formatData = function(data) {
                var s = {};
                for (var i in data.data) {
                    for (var j in data.data[i].fields) {
                        var d = data.data[i].fields[j];
                        s[d.key] = d.value;
                    }
                }
                s.id = data.id;
                s.timestamp = data.timestamp;
                return s;
            }

            ajax.formatCondition = function(data) {
                var s = {};
                if (data && typeof data.length != 'undefined') {
                    for (var i in data) {
                        var d = data[i];
                        s[d.key] = d.value;
                    }
                }

                return  s;
            }

            /**
             * 排序，按接口URL字母排序
             */
            ajax.order = function(a, b) {
                if (typeof a.url == 'string' && typeof b.url == 'string') {
                    var n = Math.min(a.url.length, b.url.length),
                        i = -1,
                        aTotal = 0,
                        bTotal = 0;
                        
                    do {
                        i++;
                        aTotal += a.url.charCodeAt(i) * Math.pow(10, n - i);
                        bTotal += b.url.charCodeAt(i) * Math.pow(10, n - i);
                    }
                    while (i < n && a.url.charCodeAt(i) == b.url.charCodeAt(i));

                    return aTotal - bTotal;
                }
            }

            /**
             * 自动增加版本号
             * @param  {[type]} v [v0.0.1]
             * @return {[type]}   [description]
             */
            ajax.autoIncrement = function(v){
                if(typeof v != 'string') return v;
 
                if(v.indexOf('v') == 0) v = v.substring(1,v.length);

                var vers = v.split('.'),
                    n = vers.length,
                    absV = 0,
                    result = '';

                for(var i = 0; i < n; i++){
                    absV += parseInt(vers[i]) * Math.pow(10, n - 1 - i);
                }
                absV++;
                absV = absV.toString();

                if(absV.length == 1){
                    absV = '00' + absV;
                }else if(absV.length == 2){
                    absV = '0' + absV;
                }

                for(var j = 0; j < absV.length; j++){
                    result += '.' + absV[j];
                }

                return result.replace('.','v');
            }
            /**
             * 转换自定义form数据成json
             */
            ajax.formToJson = function(data) {
                var s = {};
                console.log(data);
                for (var i in data) {
                    var d = data[i];
                    s[d.key] = d.value;
                }
                return s;
            };
            return ajax;
        }])

    // 给$http添加拦截器
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }])

    // register the interceptor as a service, intercepts ALL angular ajax http calls
    .factory('httpInterceptor', function($q, $location, ErrorService, $rootScope) {
        var myInterceptor = {
            request: function(config) {
                ErrorService.clearAlert();
                return config;
            },
            requestError: function(rejection) {
                return $q.reject(rejection);
            },
            response: function(response) {
                if (response.headers('content-type') == 'application/json' && response.data.code != 0) {
                    ErrorService.showAlert(response.data.message || 'Server response incorrect');
                }

                // return $q.reject(response);
                return response;
            },
            responseError: function(response) {
                if (response.status === 401) {
                    $rootScope.$broadcast('event:loginRequired');
                } else if (response.status >= 400 && response.status < 500) {
                    ErrorService.showAlert('Server was unable to find what you were looking for... Sorry!!');
                } else {
                    ErrorService.showAlert('Server unavaiable... Sorry!!');
                }
                return $q.reject(response);
            }
        };

        return myInterceptor;
    });
})
