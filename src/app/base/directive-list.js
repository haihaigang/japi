/**
 * 列表指令
 * 包含以下指令：
 * 1 搜索框
 */
define(function(require) {
    require('angular');

    angular.module('baseModule')
        /**
         * 搜索框指令
         * <div j-search j-img="user.value"></div>
         */
        .directive('jSearch', ['$log', function($log) {
            return {
                restrict: 'AEC',
                templateUrl: 'app/base/view/form-uploader.html',
                link: function($scope, element, attrs) {

                }
            };
        }])
        /**
         * 列表中删除按钮指令，添加删除确认框
         * <div j-delete j-click="do(some)"></div>
         */
        .directive('jDelete', ['$log', 'ErrorService', function($log, ErrorService) {
            return {
                restrict: 'A',
                replace: true,
                transclude: true,
                scope: {
                    jTip: '@jTip',
                    jClick: '&jClick' //当传递的函数有参数的时候，在指令中调用也不需添加参数
                },
                template: '<a href="javascript:;" ng-click="doClick()" ng-transclude></a>',
                link: function($scope, element, attrs) {
                    $scope.doClick = function() {
                        ErrorService.showConfirm({
                            message: attrs.jTip || '确认删除吗？',
                            yesCallback: $scope.jClick
                        });
                    }
                }
            };
        }])
        /**
         * 列表中快速编辑，点击直接可编辑
         * <div j-quick j-value="" j-save="do(some)"></div>
         */
        .directive('jQuick', ['$log', 'ErrorService', function($log, ErrorService) {
            return {
                restrict: 'A',
                transclude: true,
                scope: {
                    jValue: '=jValue',
                    jSave: '&jSave' //当传递的函数有参数的时候，在指令中调用也不需添加参数
                },
                template: '<span ng-click="changeStatus()" ng-show="!editable">{{jValue}}</span><input type="text" value="{{jValue}}" ng-model="jValue" ng-blur="onBlur()" ng-keyup="onKeyup($event)" ng-show="editable">',
                link: function($scope, element, attrs) {
                    if (!$scope.jValue) return;

                    var oldValue = $scope.jValue.length;
                    $scope.editable = false;
                    $scope.changeStatus = function() {
                        $scope.editable = !$scope.editable;
                    }
                    $scope.onBlur = function() {
                        $scope.editable = false;
                        // preSave();
                    }
                    $scope.onKeyup = function(e) {
                        if (e.keyCode != 13) {
                            return;
                        }
                        $scope.editable = !$scope.editable;
                        preSave();
                    }

                    //调用保存方法，只在内容有变动时修改
                    function preSave() {
                        if ($scope.jValue.length != oldValue) {
                            oldValue = $scope.jValue.length;
                            $scope.jSave();
                            return;
                        }
                    }
                }
            };
        }])
        /**
         * 展示嵌套数据
         * <div j-qiantao j-data=""></div>
         */
        .directive('jQiantao', ['$log', 'ErrorService', function($log, ErrorService) {
            return {
                restrict: 'A',
                transclude: true,
                scope: {
                    jData: '=jData',
                    jAbc: '=jAbc'
                },
                template: '<div ng-bind-html="html1"></div>',
                controller: ['$scope', function MyTabsController($scope) {
                    console.log('controller')

                    console.log($scope.jData);
                }],
                link: function($scope, element, attrs) {
                    if(!$scope.jData) return;
                    var html = getHtml($scope.jData.items);
                    $scope.html1 = html;

                    function getHtml(data) {
                        if(!data){
                            return '';
                        }

                        var str = '';
                        for (var i in data) {

                            str += '<div>' + getSep(data[i].level) + data[i].name + '</div>' + getHtml(data[i].items);
                        }

                        return str;
                    }

                    function getSep(n){
                        var i = 0;
                        var str = '';
                        while(i < n){
                            str += '——';
                            i++;
                        }

                        return str;
                    }
                }
            };
        }]);
})
