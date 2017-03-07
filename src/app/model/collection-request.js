define(function(require, exports, module){
	var Field = require('../model/field');

    function CollectionRequest(data) {
        this.id = null;
        this.collectionId = null;
        this.name = null;
        this.url = null;
        this.desc = null;
        this.method = null;
        this.dataMode = null;
        this.data = null;
        this.headers = {};

        this.init(data);
    }

    CollectionRequest.prototype.toForm = function() {
        var ret = {
                id: null,
                data: []
            },
            fields = [],
            field;

        if (this.id) {
            ret.id = this.id;
        }
        if (this.timestamp) {
            ret.timestamp = this.timestamp;
        }
        field = new Field('collectionId', '所属项目', 'select', '', true, true);
        if (this.collectionId) {
            field.value = this.collectionId;
        }
        fields.push(field);
        field = new Field('name', '接口名称', 'text', '', true, true);
        if (this.name) {
            field.value = this.name;
        }
        fields.push(field);
        field = new Field('url', '接口地址', 'text', '', true, true);
        if (this.url) {
            field.value = this.url;
        }
        fields.push(field);
        field = new Field('type', '接口类型', 'select', '', true);
        field.enumObj = [{
            "name": "普通",
            "id": "common"
        }, {
            "name": "分页",
            "id": "page"
        }];
        if (this.type) {
            field.value = this.type;
        }
        fields.push(field);
        field = new Field('method', '请求方式', 'select', '', true);
        field.enumObj = [{
            "name": "GET",
            "id": "GET"
        }, {
            "name": "POST",
            "id": "POST"
        }];
        if (this.method) {
            field.value = this.method;
        }
        fields.push(field);
        field = new Field('dataMode', '请求类型', 'select', '', true);
        field.enumObj = [{
            "name": "formdata",
            "id": "formdata"
        }, {
            "name": "urlencoded",
            "id": "urlencoded"
        }, {
            "name": "raw",
            "id": "raw"
        }];
        if (this.dataMode) {
            field.value = this.dataMode;
        }
        fields.push(field);
        field = new Field('desc', '接口描述', 'textarea');
        if (this.desc) {
            field.value = this.desc;
        }
        fields.push(field);
        ret.data.push({
            name: "基本信息",
            fields: fields
        });

        fields = [];
        field = new Field('data', '请求参数', 'mutiple', '', true);
        field.value = [];
        if (this.data && this.data.length > 0) {
            for (var i in this.data) {
                field.value.push(this.data[i]);
            }
        } else {
            field.value.push({
                "key": "",
                "type": "",
                "value": "",
                "checked": false
            })
        }
        fields.push(field);
        ret.data.push({
            name: "请求参数",
            fields: fields
        });

        fields = [];
        field = new Field('responseType', '响应类型', 'select', '', true);
        field.enumObj = [{
            "name": "Null",
            "id": "null"
        }, {
            "name": "Object",
            "id": "object"
        }, {
            "name": "Array",
            "id": "array"
        }];
        if (this.responseType) {
            field.value = this.responseType;
        }
        fields.push(field);
        field = new Field('responses', '响应参数', 'mutiple', '', true);
        field.value = [];
        if (this.responses && this.responses.length > 0) {
            for (var i in this.responses) {
                field.value.push(this.responses[i]);
            }
        } else {
            field.value = [{
                "key": "",
                "type": "",
                "value": "",
                "checked": false
            }];
        }
        fields.push(field);
        ret.data.push({
            name: "响应参数",
            fields: fields
        });

        return ret;
    }

    CollectionRequest.prototype.init = function(data) {
        if (data) {
            for (var i in data) {
                this[i] = data[i];
            }
        }
    }

    module.exports = CollectionRequest;
})