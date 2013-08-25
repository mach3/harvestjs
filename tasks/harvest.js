
module.exports = function(grunt){

	var name, description, uglify, util, Compiler;

	name = "harvest";
	description = "";
	uglify = require("uglify-js");
	util = require("util");

	Compiler = function(src, path, uglifyCompress){
		var my = this;

		this.src = src;
		this.path = path;
		this.uglifyCompress = uglifyCompress;

		this.unify = function(){
			var content, files, code;
			content = uglify.minify(this.src).code;
			files = this.parse(content);
			code = this.combine(files);
			return code;
		};

		this.combine = function(files){
			var code = "";
			if(!! this.uglifyCompress){
				code = uglify.minify(files, {
					compress: this.uglifyCompress
				}).code;
			} else {
				files.forEach(function(file){
					code += ";" + grunt.file.read(file);
				});
			}
			return code;
		};

		this.parse = function(content){
			var r, calls;
			r = [];
			calls = content.match(/harvest\((.+?)\)/g);
			if(calls){
				calls.forEach(function(s){
					var files = s.match(/("([^,"\s]+?)"|'([^,'\s]+?)')/g);
					files.forEach(function(file){
						r.push(my.path + "/" + file.replace(/"|'/g, ""));
					});
				});
			}
			return r;
		};
	};

	grunt.registerMultiTask(name, description, function(){

		var options = this.options({
			banner: "",
			uglify: {},
			path: ""
		});

		options.banner = grunt.template.process(options.banner);

		this.files.forEach(function(file){
			var compiler, code;
			try {
				compiler = new Compiler(file.src, options.path, options.uglify);
				code = compiler.unify();
				if(! code){
					throw new Error("Failed to parse code. It's invalid or empty :\n" +  JSON.stringify(file.src));
				}
				if(! grunt.file.write(file.dest, options.banner + code)){
					throw new Error("Failed to write in file : " + file.dest);
				}
				grunt.log.writeln(util.format("'%s' has been saved.", file.dest));

			} catch(e){
				grunt.log.error(e.message);
			}
		});

	});

};
