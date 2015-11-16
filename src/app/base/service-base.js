/**
 * 基础服务，包含统一错误提示、身份权限认证、本地存储
 */

define(function(require) {
    require('angular');

    angular.module('baseModule')
        //统一错误提示
        .factory('ErrorService', function() {
            return {
                dialogOptions: null,
                isLoading: false,
                toastMessage: null,
                setError: function(msg) {
                    this.dialogOptions = {
                        message: msg
                    };
                },
                showAlert: function(msg) {
                    this.dialogOptions = {
                        message: msg,
                        show: true
                    }
                },
                clearAlert: function() {
                    this.dialogOptions = null;
                },
                showConfirm: function(msg) {
                    if (typeof msg == 'object') {
                        this.dialogOptions = msg;
                        this.dialogOptions.show = true;
                        this.dialogOptions.showCancel = true;
                    } else {
                        this.dialogOptions = {
                            message: msg,
                            showCancel: true
                        }
                    }
                },
                showLoading: function() {
                    this.isLoading = true;
                },
                hideLoading: function() {
                    this.isLoading = false;
                },
                showToast: function(msg) {
                    this.toastMessage = msg;
                }
            };
        })
        //身份认证与权限控制
        .factory('Auth', ['Storage', 'ROLES', function(Storage, ROLES) {
            return {
                token: null,
                auth: null,
                setToken: function(token) {
                    this.token = token;
                },
                setAuth: function(name) {
                    Storage.set(Storage.AUTH, name);
                },
                getAuth: function() {
                    this.auth = this.auth || Storage.get(Storage.AUTH);
                    return this.auth;
                },
                clear: function() {
                    Storage.remove(Storage.AUTH);
                },
                isAuthenticated: function() {
                    this.auth = this.auth || Storage.get(Storage.AUTH);
                    return !!this.auth;
                },
                isAuthorized: function(roles) {
                    if (typeof roles == 'undefined') {
                        //默认仅验证身份
                        return this.isAuthenticated();
                    }

                    if (!angular.isArray(roles)) {
                        roles = [roles];
                    }
                    if (roles.indexOf(ROLES.GUEST) !== -1) {
                        //设置GUEST角色，不验证身份，所有用户都可以访问
                        return true;
                    } else {
                        //其它验证身份和权限
                        return (this.isAuthenticated() &&
                            roles.indexOf('admin') !== -1);
                    }
                }
            };
        }])
        //本地存储
        .factory('Storage', ['$log', function($log) {
            return {
                AUTH: 'FLV-AUTH',
                ACCOUNT: 'FLV-ACCOUNT',
                REMEMBER: 'FLV-REMEMBER',
                AREA: 'FLV-AREA',
                get: function(key, isSession) {
                    if (!this.isLocalStorage()) {
                        return;
                    }
                    var value = this.getStorage(isSession).getItem(key);
                    try {
                        return JSON.parse(value);
                    } catch (e) {
                        return value;
                    }
                },
                set: function(key, value, isSession) {
                    if (!this.isLocalStorage()) {
                        return;
                    }
                    if (typeof value == 'object') {
                        value = JSON.stringify(value);
                    }
                    this.getStorage(isSession).setItem(key, value);
                },
                remove: function(key, isSession) {
                    if (!this.isLocalStorage()) {
                        return;
                    }
                    this.getStorage(isSession).removeItem(key);
                },
                getStorage: function(isSession) {
                    return isSession ? sessionStorage : localStorage;
                },
                isLocalStorage: function() {
                    try {
                        if (!window.localStorage) {
                            $log.info('不支持本地存储');
                            return false;
                        }
                        return true;
                    } catch (e) {
                        $log.info('本地存储已关闭');
                        return false;
                    }
                }
            };
        }])
        //面包屑导航
        .factory('Breadcrumb', ['$log', function($log) {
            return {
                data: [],
                home: {
                    name: '首页',
                    url: 'home'
                },
                setData: function(d){
                    this.data = d;
                },
                init: function(name, url, opt) {
                    this.data = [];
                    this.data.push(this.home);
                    this.data.push({
                        name: name,
                        url: url
                    });
                    if (opt) {
                        this.data.push({
                            name: opt,
                            active: 'active'
                        });
                    }
                    return this.data;
                }
            };
        }])
})
