define(function(require, exports, module) {
	var Field = require('../model/field');

    function Collection(data) {
        this.id = null;
        this.name = null;
        this.desc = null;
        this.version = null;
        this.content = null;

        this.synced = false;
        this.remoteLink = null;

        this.init(data);
    }

    Collection.prototype.toForm = function(data) {
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
        field = new Field('name', '项目名称', 'text', '', true, true);
        if (this.name) {
            field.value = this.name;
        }
        fields.push(field);
        field = new Field('desc', '项目描述', 'textarea');
        if (this.desc) {
            field.value = this.desc;
        }
        fields.push(field);
        field = new Field('version', '项目版本', 'text');
        if (this.version) {
            field.value = this.version;
        } else {
            field.value = 'v0.0.1';
        }
        fields.push(field);
        field = new Field('content', '接口约定', 'textarea');
        if (this.content) {
            field.value = this.content;
        }
        fields.push(field);
        ret.data.push({
            name: "基本信息",
            fields: fields
        });

        fields = [];
        field = new Field('host', '接口主机', 'text');
        if (this.host) {
            field.value = this.host;
        }
        fields.push(field);
        ret.data.push({
            name: "附加信息",
            fields: fields
        })
        return ret;
    }

    Collection.prototype.init = function(data) {
        if (data) {
            for (var i in data) {
                this[i] = decodeURIComponent(data[i]);
            }
        }
    }

    module.exports = Collection;
})
