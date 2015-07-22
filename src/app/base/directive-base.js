define(function(reqiure) {
    reqiure('angular');

    angular.module('baseModule')
        /**
         * 自适应垂直居中
         * <div j-middle></div>
         */
        .directive('jMiddle', ['$log', function($log) {
            return {
                restrict: 'A',
                link: function($scope, $element, $attrs) {
                    //设置上下居中（todo兼容性）
                    function init() {
                        var deh = document.documentElement.clientHeight, //窗口高度
                            dbh = document.body.clientHeight; //内容高度
                        $log.info('deh=' + deh + ',dbh=' + dbh);

                        if (deh > dbh) {
                            $element.css({
                                'margin-top': +(deh - dbh) / 2
                            });
                        } else {
                            $element.css({
                                'margin-top': 'inherit'
                            });
                        }
                    }

                    init();
                    $(window).resize(function() {
                        init();
                    })
                }
            };
        }])
        /**
         * 面包屑导航
         * <div j-breadcrumb j-data="some"></div>
         */
        .directive('jBreadcrumb', ['$log', function($log) {
            return {
                restrict: 'A',
                replace: true,
                scope: {
                    jData: '=jData'
                },
                template: '<ol class="breadcrumb"><li ng-repeat="d in jData" ng-class="d.active"><a ui-sref="{{d.url}}" ng-if="!$last">{{d.name}}</a><span ng-if="$last">{{d.name}}</span></li></ol>'
            };
        }])
        .directive('jScrollTo', ['$log', function($log) {
            return {
                restrict: 'A',
                link: function($scope, element, attrs) {
                    $(element).click(function(e) {
                        e.preventDefault();

                        var idx = $(this).index();
                        var top = $('#p-' + idx).offset().top;
                        window.scrollTo(0, top);
                    })
                }
            }
        }])
        .directive('jFixed', ['$log', function($log) {
            return {
                restrict: 'A',
                link: function($scope, element, attrs) {
                    var stop = $(element).offset().top + 20;
                    var flag = false;

                    $(window).scroll(function() {
                        if ($(window).scrollTop() > stop) {
                            if (!flag) {
                                flag = true;
                                $(element).css({
                                    'position': 'fixed',
                                    'top': '0px',
                                    'width': $(element).width()
                                });
                            }
                        } else {
                            flag = false;
                            $(element).css({
                                'position': 'inherit',
                                'top': 'inherit'
                            });
                        }
                    })
                }
            }
        }])
})
