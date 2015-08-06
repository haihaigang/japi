/**
 * 扩展$http，添加拦截
 */
define(function(require) {
    require('angular');

    angular.module('ajaxService', [])
        .factory('Ajax', ['$http', '$rootScope', 'errorService', function($http, $rootScope, errorService) {
            var ajax = {
                breadcrumbs: []
            };

            var extendHeaders = function(config) {
                config.headers = config.headers || {};
                config.headers['from'] = 'api';
            }

            angular.forEach(['get', 'delete', 'head', 'jsonp'], function(name) {
                ajax[name] = function(options, callback, callbackError) {
                    if (!options.isSilent) {
                        $rootScope.isLoading = true;
                        $rootScope.isSuccess = false;
                        $rootScope.errorMsg = '正在加载中......';
                        errorService.showLoading();
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
                            errorService.hideLoading();
                            // if (data.code != 0) {
                            //     $rootScope.errorMsg = data.message || '获取数据失败';
                            //     return;
                            // }
                            $rootScope.isSuccess = true;
                            $rootScope.isLoading = false;
                            $rootScope.errorMsg = '';
                            callback && callback(data);
                        }, function(response) {
                            errorService.hideLoading();
                            $rootScope.errorMsg = '服务器响应失败';
                            $rootScope.isLoading = false;
                            callbackError && callbackError(response);
                        });
                }
            });

            angular.forEach(['post', 'put'], function(name) {
                ajax[name] = function(options, callback, callbackError) {
                    if (!options.isSilent) {
                        $rootScope.isSubmiting = true;
                        //$rootScope.isSuccess = false;
                        $rootScope.errorMsg = '正在提交中......';
                        errorService.showLoading();
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
                            errorService.hideLoading();
                            var data = response.data;
                            if (data.code != 0) {
                                $rootScope.errorMsg = data.message || '获取数据失败';
                                return;
                            }
                            //$rootScope.isSuccess = true;
                            $rootScope.isSubmiting = false;
                            callback && callback(data);
                        }, function(response) {
                            errorService.hideLoading();
                            $rootScope.errorMsg = '服务器响应失败';
                            $rootScope.isSubmiting = false;
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

                return data || s;
            }
            return ajax;
        }])

    // 给$http添加拦截器
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('httpInterceptor');
    }])

    // register the interceptor as a service, intercepts ALL angular ajax http calls
    .factory('httpInterceptor', function($q, $location, errorService, $rootScope) {
        var myInterceptor = {
            request: function(config) {
                errorService.clearAlert();
                return config;
            },
            requestError: function(rejection) {
                return $q.reject(rejection);
            },
            response: function(response) {
                if (response.headers('content-type') == 'application/json; charset=utf-8' && response.data.code != 0) {
                    errorService.showAlert(response.data.message || 'Server response incorrect');
                }

                // return $q.reject(response);
                return response;
            },
            responseError: function(response) {
                if (response.status === 401) {
                    $rootScope.$broadcast('event:loginRequired');
                } else if (response.status >= 400 && response.status < 500) {
                    errorService.showAlert('Server was unable to find what you were looking for... Sorry!!');
                } else {
                    errorService.showAlert('Server unavaiable... Sorry!!');
                }
                return $q.reject(response);
            }
        };

        return myInterceptor;
    });
})
