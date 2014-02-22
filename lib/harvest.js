/**
 * Harvest as node module library
 * ------------------------------
 */

var _ = require("underscore"),
    fs = require("fs"),
    path = require("path"),
    app = {};

_.extend(_, {
    type: function(obj){
        var m = Object.prototype.toString.call(obj).match(/\[object\s(\w+?)\]/);
        return m ? m[1].toLowerCase() : null;
    }
});


app.Harvest = function(){
    this.init.apply(this, arguments);
};

(function(){

    /**
     * Defaults for data:
     * - {String} json - JSON file path
     * - {String} root - Root directory for files
     * - {Object} files - Files to be unified
     * - {Array|String} watch - Watch files expression
     * - {String} suffix - Suffix for minification or something
     */
    this.defaults = {
        json: null,
        root: null,
        files: null,
        watch: null,
        suffix: ".min"
    };

    this.data = null;

    this.regex = {
        ext: /\.(\w+?)$/,
        exclude: /^!/
    };

    /**
     * Initialize
     * @constructor
     * @param {String} json
     */
    this.init = function(json) {
        this.data = {};
        this.config(this.defaults);
        this.config(JSON.parse(fs.readFileSync(json, "utf-8")));
        this.config({
            json: json,
            root: path.dirname(json)
        });
        this.resolve();
    };

    /**
     * Configure data
     * @param {Object} data
     */
    this.config = function(data) {
        _.extend(this.data, data);
    };

    /**
     * Get value from data by key
     * @param {String} key
     * @returns {*}
     */
    this.get = function(key) {
        return this.data[key];
    };

    /**
     * Resolve the data
     * - Resolve the files' path
     * - Resolve watch list
     * - Configure
     */
    this.resolve = function() {
        var files, root, type, watch, my = this;

        files = {};
        root = this.get("root");
        type = null;

        // files: resolve
        _.each(this.get("files"), function(src, dest) {
            var data = [];
            src = _.isArray(src) ? src : [src];
            src.forEach(function(file) {
                if(! type){
                    type = my.getExtention(file);
                }
                data.push(path.join(root, file));
            });
            files[path.join(root, dest)] = data;
        });

        // watch: get
        watch = this.get("watch");
        switch(_.type(watch)){
            case "null": 
                watch = ["**/*" + (type || "")]
                break;
            case "string":
                watch = [watch];
                break;
            default: break;
        }

        // watch: resolve
        watch = watch.map(function(target){
            var ex = false;
            target = target.replace(/^!/, function(){
                ex = true;
                return "";
            });
            return (ex ? "!" : "" ) + path.join(root, target);
        });

        // add JSON
        watch.push(this.get("json"));

        // override
        this.config({
            files: files,
            watch: watch
        });
    };

    /**
     * Get extention by file name
     * @param {String} name
     * @param {String|Null}
     */
    this.getExtention = function(name){
        var m = name.match(this.regex.ext);
        return m ? "." + m[1] : null;
    };

    /**
     * Return the files for concat, uglify or something
     * @returns {Object}
     */
    this.files = function() {
        return this.get("files");
    };

    /**
     * Return the files with suffix, like ".min"
     * @returns {Object}
     */
    this.suffix = function(suffix) {
        var my = this,
            files = {};

        suffix = suffix || this.get("suffix");
        _.each(this.get("files"), function(src, dest) {
            var name = dest.replace(my.regex.ext, suffix + ".$1");
            files[name] = src;
        });
        return files;
    };

    /**
     * Return watch list
     * @returns {Array}
     */
    this.watch = function() {
        return this.get("watch");
    };

}).call(app.Harvest.prototype);

/**
 * API
 * ---
 */
module.exports = {
    init: function(json){
        return new app.Harvest(json);
    }
};
