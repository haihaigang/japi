/**
 * 静态服务，包括接口地址、用户角色
 */
define(function(require) {
    require('angular');

    //使用当前应用相同的模块名称，可以把当前定义的服务放到全局使用
    angular.module('baseModule')
        //接口地址等配置信息
        .constant('CONFIG', {
            HOST_API: 'http://'location.host'/',
            HOST_IMAGE: '',
            DEF_URL_IMG: 'image/d300x300-1.png', //默认图片地址

            API_ACCOUNT_LOGIN: 'data/account/login.json',

            API_COLLECTION_SYNC: 'webapi.php/399',
            API_COLLECTION_LIST: 'data/collection/list.json',
            API_COLLECTION_ADD: 'data/collection/add.json',
            API_COLLECTION_EDIT: 'data/collection/edit.json',
            API_COLLECTION_SAVE: 'data/collection/save.json',

            API_REQUEST_LIST: 'data/request/list.json',
            API_REQUEST_ADD: 'data/request/add.json',
            API_REQUEST_EDIT: 'data/request/edit.json',
            API_REQUEST_SAVE: 'data/request/save.json',

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
        .constant('VERSION','v0.1')
})
