/**
 * 公共控制器模块
 */
define(function(require) {
    require('angular');

    angular.module('mainModule', [])
        // * 全局控制器
        .controller('MainController', ['$scope', 'errorService', function($scope, errorService) {
            $scope.errorService = errorService;

            $scope.filterOptions = {
                filterText: '',
                useExternalFilter: true
            };
            $scope.totalServerItems = 0;
            $scope.pagingOptions = {
                pageSizes: [5, 10, 20],
                pageSize: 10,
                currentPage: 1
            };
            $scope.$watch('pagingOptions', function(newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);
            $scope.$watch('filterOptions', function(newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);

            $scope.gridOptions = {
                data: 'page.pageData',
                enableRowSelection: true,
                enableCellEdit: true,
                enablePaging: true,
                showFooter: true,
                showSelectionCheckbox: true,
                headerRowHeight: 40,
                rowHeight: 50,
                i18n: 'zh-cn',
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions
            };

        }])

})
