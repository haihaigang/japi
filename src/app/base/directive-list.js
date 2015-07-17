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
                // template:'<div class="panel panel-info"><div class="panel-heading"><input class="btn btn-default" type="file" name="{{file.parameter}}" multiple/></div><div class="panel-body"><div ng-repeat="file in fileList"  style="text-align:center;" class="bg-primary"><span>{{file.filename}}</span><button ng-click="erase(this)" type="button" class="close" aria-hidden="true">&times;</button><div class="progress"><div min-width="10%" class="progress-bar" role="progressbar" aria-valuenow="{{file.value}}" aria-valuemin="0" aria-valuemax="100" style="width: {{file.value}}%;">{{file.size}}/{{file.total}}</div></div></div><button class="btn btn-success" type="button" ng-click="startUpload(event)">Upload</button></div></div>',
                templateUrl: 'app/base/view/form-uploader.html',
                link: function($scope, element, attrs) {

                }
            };
        }])
        /**
         * 列表中删除按钮指令，添加删除确认框
         * <div j-delete j-click="do(some)"></div>
         */
        .directive('jDelete', ['$log', 'errorService', function($log, errorService) {
            return {
                restrict: 'A',
                replace: true,
                transclude: true,
                scope: {
                    jClick: '&jClick' //当传递的函数有参数的时候，在指令中调用也不需添加参数
                },
                template: '<a href="javascript:;" ng-click="doClick()" ng-transclude></a>',
                link: function($scope, element, attrs) {
                    $scope.doClick = function() {
                        errorService.showConfirm({
                            message: '确认删除吗？',
                            yesCallback: $scope.jClick
                        });
                    }
                }
            };
        }]);
})
