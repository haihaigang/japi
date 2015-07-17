/**
 * 提示信息指令
 * 包含以下指令：
 * 1 全局警告
 * 2 加载进度条
 * 3 toast提示
 * 4 提示框（alert、confirm）
 */
define(function(require) {
    require('angular');

    var module = angular.module('dialogDirective', []);

    /**
     * 全局警告指令
     * <div alert-bar error-message="someMessage"></div>
     */
    module.directive('alertBar', ['$parse', '$timeout', 'errorService', function($parse, $timeout, errorService) {
        return {
            restrict: 'A',
            template: '<div class="alert alert-info alert-dismissible alert-bar" ng-show="errorMessage">' +
                '<button type="button" class="close" ng-click="hideAlert()">x</button>' +
                '{{errorMessage}}</div>',
            scope: true,
            replace: true,
            link: function($scope, elem, attrs) {
                var alertMessageAttr = attrs['errorMessage'];
                $scope.errorMessage = alertMessageAttr;

                $scope.$watch(alertMessageAttr, function(newVal) {
                    $scope.errorMessage = newVal;

                    $timeout(function() {
                        $scope.errorMessage = null;
                        $parse(alertMessageAttr).assign($scope, null);
                    }, 1500);
                });
                $scope.hideAlert = function() {
                    $scope.errorMessage = null;
                    // Also clear the error message on the bound variable
                    // Do this so that in case the same error happens again
                    // the alert bar will be shown again next time
                    $parse(alertMessageAttr).assign($scope, null);
                };
            }
        };
    }]);

    /**
     * 加载进度条
     * <div j-loading is-loading="true|false"></div>
     */
    module.directive('jLoading', [function() {
        return {
            restrict: 'A',
            template: '<div class="loading" ng-show="isLoading">' + '<div class="loading-content">' + '<div class="s-1"></div>' + '<div class="s-2">正在加载中</div>' + '</div>' + '</div>',
            scope: true,
            replace: true,
            link: function($scope, elem, attrs) {
                $scope.isLoading = attrs.isLoading;
                $scope.$watch(attrs.isLoading, function(newVal) {
                    $scope.isLoading = newVal;
                });
            }
        };
    }]);


    /**
     * Toast提示
     * <div j-toast toast-message="some"></div>
     */
    module.directive('jToast', ['$parse', '$timeout', function($parse, $timeout) {
        return {
            restrict: 'A',
            template: '<div class="toast" ng-show="toastMessage"><span>{{toastMessage}}</span></div>',
            scope: true,
            replace: true,
            link: function($scope, elem, attrs) {
                var timer;

                $scope.toastMessage = attrs.toastMessage;
                $scope.$watch(attrs.toastMessage, function(newVal) {
                    $scope.toastMessage = newVal;
                    if (timer) {
                        $timeout.cancel(timer);
                    }
                    timer = $timeout(function() {
                        $scope.toastMessage = null;
                        $parse(attrs.toastMessage).assign($scope, null);
                    }, 1000);
                });
            }
        };
    }]);

    /**
     * 提示框（模拟alert、confirm）
     * <div j-dialog options="some"></div>
     */
    module.directive('jDialog', ['$parse', '$timeout', function($parse, $timeout) {
        return {
            restrict: 'A',
            template: '<div class="dialog" ng-show="data.message">' + '<div class="dialog-content">' + '<div class="panel-content">' + '<div class="panel-cell">' + '<h3 class="panel-title" ng-show="data.showTitle">{{data.titleText}}</h3>' + '<div class="panel-text">{{data.message}}</div>' + '</div>' + '</div>' + '<div class="panel-buttons">' + '<div class="options">' + '<a href="javascript:;" class="btn btn-primary" ng-show="data.showOk" ng-click="hide()">{{data.okText}}</a><a href="javascript:;" class="btn btn-default" ng-show="data.showCancel" ng-click="cancel()">{{data.cancelText}}</a>' + '</div>' + '<div class="panel-tips" ng-show="data.showTips">若在<span class="panel-tick">5</span>秒内无反应自动跳转到订单的详情页面</div>' + '</div>' + '</div>' + '</div>',
            scope: true,
            replace: true,
            link: function($scope, elem, attrs) {
                var timer,
                    data = {},
                    def = {
                        message: null,
                        showTitle: false,
                        titleText: '提示',
                        showOk: true,
                        okText: '确定',
                        showCancel: false,
                        cancelText: '取消',
                        showTips: false,
                        tipsText: '',
                        tick: 0,
                        tipsCallback: function() {},
                        yesCallback: function() {},
                        noCallback: function() {}
                    },
                    options = attrs.options;

                for (var i in def) {
                    data[i] = typeof options[i] != 'undefined' ? options[i] : def[i];
                }

                $scope.data = data;
                $scope.$watch(options, function(newVal) {
                    if (newVal) {
                        for (var i in def) {
                            data[i] = typeof newVal[i] != 'undefined' ? newVal[i] : def[i];
                        }
                        $scope.data = data;
                    }
                    if (timer) {
                        $timeout.cancel(timer);
                    }
                    if (data.tick > 0) {
                        timer = $timeout(function() {
                            typeof data.tipsCallback == 'function' && data.tipsCallback();
                            $scope.data = null;
                            $parse(options).assign($scope, null);
                        }, data.tick);
                    }
                });

                $scope.hide = function() {
                    typeof data.yesCallback == 'function' && data.yesCallback();
                    $scope.data = null;
                    $parse(options).assign($scope, null);
                };

                $scope.cancel = function() {
                    typeof data.noCallback == 'function' && data.noCallback();
                    $scope.data = null;
                    $parse(options).assign($scope, null);
                };

                if ('addEventListener' in window) {
                    document.addEventListener('keyup', function(e) {
                        var code = e.which || e.keyCode;

                        if(!$scope.data) return;

                        if(code == 27){
                            $scope.cancel();
                        }else if(code == 13){
                            $scope.hide();
                        }
                    })
                }
            }
        };
    }]);
})
