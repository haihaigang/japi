/**
 * 字段模块
 * @param  {[type]} require [description]
 * @param  {[type]} exports [description]
 * @param  {[type]} module) {               function Field(key, title, type, value, display, required) {        this.key [description]
 * @return {[type]}         [description]
 */
define(function(require, exports, module) {
    function Field(key, title, type, value, display, required) {
        this.key = key;
        this.title = title;
        this.type = type;
        this.value = value;
        this.display = display || true;
        this.required = required || false;
    }

    module.exports = Field;
})
