/**
 * 过滤器模块
 */
define(function(require) {
    require('angular');

    angular.module('baseModule')
    	//转换时间戳长度，有的接口返回时间戳长度是10位
        .filter('timestamp', function() {
            return function(content) {
                if (typeof content == 'number') {
                    content *= 1000;
                } else if (typeof content == 'string') {
                    content += '000';
                }

                return content;
            }
        })
        //确定状态文本
        .filter('state', function(){
        	return function(content, v1, v2){
        		return content == 1 ? (v1 || '已审核') : (v2 || '未审核');
        	}
        })
})
