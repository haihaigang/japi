/**
 * 静态服务，包括接口地址、用户角色
 */
define(function(require) {
    require('angular');

    //使用当前应用相同的模块名称，可以把当前定义的服务放到全局使用
    angular.module('baseModule')
        //接口地址等配置信息
        .constant('CONFIG', {
            HOST_API: location.protocol +'//'+location.host+'/',
            HOST_API: 'http://121.43.115.115:8088/',
            HOST_IMAGE: '',
            DEF_URL_IMG: 'image/d300x300-1.png', //默认图片地址

            API_ACCOUNT_LOGIN: 'data/account/login.json',

            API_COLLECTION_SYNC: 'webapi.php?api=399',
            API_COLLECTION_LIST: 'webapi.php?api=301',
            API_COLLECTION_QUERY: 'webapi.php?api=302',
            API_COLLECTION_SAVE: 'webapi.php?api=303',
            API_COLLECTION_REMOVE: 'webapi.php?api=304',

            API_REQUEST_LIST: 'webapi.php?api=305',
            API_REQUEST_QUERY: 'webapi.php?api=306',
            API_REQUEST_SAVE: 'webapi.php?api=307',
            API_REQUEST_REMOVE: 'webapi.php?api=308',

            API_GLOBAL_UPLOAD: 'data/upload.json',
            API_GLOBAL_REGION: 'data/region.json',
            API_GLOBAL_PASSWORD: 'data/password.json',
            abc: ''
        })
        //用户角色
        .constant('ROLES', {
            ADMIN: 'admin',
            USER: 'user',
            GUEST: '*'
        })
        .constant('VERSION','v0.0.1')
})
