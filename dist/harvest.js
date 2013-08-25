/*!
 * HarvestJS
 * ---------
 * Simple script loader
 * 
 * @version 0.9.0
 * @author mach3 <http://github.com/mach3>
 * @url http://github.com/mach3/harvestjs
 * @license MIT License
 */
 (function(win, doc){

	/**
	 * Namespace
	 * ---------
	 */
	var ns = win._harvest = {};

	/**
	 * Loader
	 * ------
	 */
	ns.el = null; // Self script element
	ns.path = null; // Path to the script root
	ns.asset = null; // Asset collection

	/**
	 * Initialize harvest object
	 * - set element, path, assets, and call load
	 */
	ns.initialize = function(){
		var my, el, path, asset;

		my = this;
		// Get self script element
		el = this.el = this._last("script");
		// Get path info
		path = this._data(el, "path");
		if(typeof path !== "string"){
			path = el.src.replace(/(\?|#).+?$|[^\/]+?$/g, "");
		}
		this.path = path;
		// Get asset
		asset = {
			"init": [],
			"main": []
		};
		this._each(asset, function(files, key){
			var data = my._data(el, key);
			if(! data){ return; }
			my._each(data.split(/\s|,/), function(name){
				if(! name){ return; }
				files.push(name);
			});
		});
		this.asset = asset;
		// load them
		if(asset.init.length){
			this.load(asset.init);
		}
		if(asset.main.length){
			this._onReady(function(){
				my.load(asset.main);
			});
		}
	};

	/**
	 * Load resources in data-init and data-ready
	 * @param Array files
	 */
	ns.load = function(files){
		(new this.Harvest()).load(files);
	};

	/**
	 * Utilities
	 * ---------
	 */

	/**
	 * Get last element by name
	 * @param String name
	 * @return HTML*Element
	 */
	ns._last = function(name){
		var els = document.getElementsByTagName(name);
		return els[els.length - 1];
	};

	/**
	 * Get value from data-* attribute
	 * @param HTML*Element el
	 * @param String name
	 * @return String
	 */
	ns._data = function(el, name){
		return el.getAttribute("data-" + name);
	};

	/**
	 * Run callback for each members in object
	 * @param Object o
	 * @param Function callback
	 */
	ns._each = function(o, callback){
		var i;
		for(i in o){
			if(! o.hasOwnProperty(i)){ continue; }
			if(false === callback(o[i], i, o)){ break; }
		}
	};

	/**
	 * Wrapper and fallback for Function.prototype.bind
	 * @param Function func
	 * @param Object scope
	 */
	ns._bind = function(func, scope){
		if(Function.prototype.bind){
			return func.bind(scope);
		}
		return function(){
			func.apply(scope, arguments);
		};
	};

	/**
	 * Add event listener to document ready
	 * @param Function callback
	 */
	ns._onReady = function(callback){
		var process = function(e){
			if(callback._done){
				return;
			}
			if(/^(interactive|complete)$/.test(doc.readyState)){
				callback._done = true;
				callback();
			}
		};
		this._on(doc, "DOMContentLoaded", process);
		this._on(doc, "readystatechange", process);
		this._on(win, "load", process);
		process();
	};

	/**
	 * Wrapper and fallback for addEventListener
	 * @param HTMLElement
	 * @param String name
	 * @param Function func
	 */
	ns._on = function(el, name, func){
		if(el.addEventListener){
			return el.addEventListener(name, func, false);
		}
		if(el.attachEvent){
			return el.attachEvent("on" + name, func);
		}
	};

	/**
	 * Harvest class
	 * -------------
	 */
	ns.Harvest = function(){
		this.path = ns.path;
	};

	(function(){

		this.head = ns._last("head"); // HTMLHeadElement to append script
		this.path = ""; // Path to the script root
		this.count = 0; // Number of resources
		this.callback = null; // Callback for when all scripts loaded

		/**
		 * Load script files
		 * Path of files must be relative to _harvest.path ( = this.path)
		 * @param Array files
		 */
		this.load = function(files){
			var i, count;
			this.count = count = files.length;
			for(i=0; i<count; i++){
				this.appendScript(this.path + files[i]);
			}
		};

		/**
		 * Append script element, add event listener for them
		 * @param String url
		 */
		this.appendScript = function(url){
			var el = doc.createElement("script");
			el.setAttribute("type", "text/javascript");
			el.setAttribute("src", url);
			el.async = false;
			ns._on(el, "load", ns._bind(this._process, this));
			ns._on(el, "readystatechange", ns._bind(this._process, this));
			this.head.appendChild(el);
		};

		/**
		 * Handler for script element's load/readystate
		 * When all script loaded, run callback
		 */
		this._process = function(e){
			var el = e.srcElement;
			if(el._loaded){
				return;
			}
			if(e.type !== "load" && ! /^(complete|loaded)$/.test(el.readyState)){
				return;
			}
			el._loaded = true;
			if(! -- this.count && typeof this.callback === "function"){
				this.callback();
			}
		};

	}).call(ns.Harvest.prototype);


	/**
	 * API
	 * ---
	 */

	/**
	 * Import script files 
	 * If you pass function as last argument, set callback it for their all loaded
	 * @param String file (multiple)
	 * @param Function callback (optional)
	 */
	win.harvest = function(/* file1, file2, file3, [callback] */){
		var args, obj;
		args = [].slice.call(arguments);
		obj = new ns.Harvest();
		if(typeof args[args.length - 1] === "function"){
			obj.callback = args.pop();
		}
		obj.load(args);
	};

	/**
	 * Initialize
	 * ----------
	 */
	ns.initialize();

}(window, document));