(function(win, doc){

	/**
	 * Namespace
	 * ---------
	 */
	var ns = win._harvest = {};

	ns.path = null; // path to script root directory

	/**
	 * Assets class
	 * ------------
	 */
	ns.Assets = function(){
		this.items = [];
		this.nodes = [];
	};

	(function(){

		/**
		 * Attributes:
		 * - supportAsync:Boolean Script element's "async" is supported or not
		 * - head:HTMLHeadElement
		 * - items:Array File names to load
		 * - nodes:Array Script elements to be appended
		 * - count:Integer Count of resources
		 * - callback:Function Callback function for completing to load
		 */
		this.supportAsync = doc.createElement("script").async !== undefined;
		this.head = doc.getElementsByTagName("head")[0];
		this.items = null;
		this.nodes = null;
		this.count = 0;
		this.callback = null;

		/**
		 * Add files to load
		 * @param Array files
		 */
		this.add = function(files){
			var my = this;
			ns._each(files, function(value){
				my.items.push(value);
			});
			this.count = this.items.length;
			return this;
		};

		/**
		 * Set callback function for complete
		 * @param Function callback
		 */
		this.onComplete = function(callback){
			if(ns._isFunction(callback)){
				this.callback = callback;
			}
		};

		/**
		 * Start to load
		 * Create script element, append them if async supported, wait for getting ready if not
		 */
		this.load = function(){
			var my = this;
			ns._each(this.items, function(url){
				var el = doc.createElement("script");
				ns._on(el, "load", ns._bind(my._process, my, el));
				ns._on(el, "readystatechange", ns._bind(my._process, my, el));
				el.type = "text/javascript";
				el.src = url;
				if(my.supportAsync){
					el.async = false;
					my.head.appendChild(el);
				}
				my.nodes.push(el);
			});
			return this;
		};

		/**
		 * Handler for readystatechange and load event of script element
		 * If all resources seem to be loaded, call _complete()
		 */
		this._process = function(el, e){
			if(el._loaded){ return; }
			// on IE10, script is not ready when readyState == "loaded"
			var loaded = (this.supportAsync && e.type === "load")
			|| (! this.supportAsync && el.readyState === "loaded");
			if(loaded){
				el._loaded = true;
				this.count -= 1;
				if(! this.count){ this._complete(); }
			}
		};

		/**
		 * Complete the process
		 * If async not supported, append all script elements
		 * If callback is set, call it
		 */
		this._complete = function(){
			var my = this;
			if(! this.supportAsync){
				ns._each(this.nodes, function(el){
					my.head.appendChild(el);
				});
			}
			if(ns._isFunction(this.callback)){
				this.callback(this);
			}
		};

	}).call(ns.Assets.prototype);


	/**
	 * Loader Object
	 * -------------
	 */
	ns.loader = {

		/**
		 * Attributes:
		 * - Script element of my own
		 */
		el: null,

		/**
		 * Initialize from script element
		 * Get asset files and path from data-* attributes
		 * If data-main has some value, load them
		 * If data-path has some value, set it as script root directory, 
		 * if not, use harvest.js's path
		 */
		initialize: function(){
			var el, path, files;
			el = ns._last("script");
			path = ns._data(el, "path");
			if(typeof path !== "string"){
				path = el.src.replace(/(\?|#).+?$|[^\/]+?$/g, "");
			}
			ns.path = path;
			files = this.getAssets(el, "main");
			files = this.parse(files);
			if(files.length){
				ns._onReady(ns._bind(this.load, this, files));
			}
		},

		/**
		 * Get asset file names from data-[name]
		 * @param HTMLScriptElement el
		 * @param String name
		 */
		getAssets: function(el, name){
			var data = ns._data(el, name);
			if(data){ return data.split(/\s|,/); }
			return [];
		},

		/**
		 * Parse the file names
		 * Remove empty and add path
		 */
		parse: function(files){
			var r = [];
			ns._each(files, function(name){
				if(name){ r.push(ns.path + name); }
			});
			return r;
		},

		/**
		 * Load script files using Assets class
		 * @param Array files
		 * @param Function callback (optional)
		 */
		load: function(files, callback){
			var assets = new ns.Assets();
			assets.add(files);
			assets.onComplete(callback);
			assets.load();
		}
	};

	/**
	 * Utils
	 * -----
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
	 * Set function scope like Function.prototype.bind
	 * This can pass some arguments (they are prepended to arguments which is passed to callback)
	 * @param Function func
	 * @param Object scope
	 * @param Mixed arg1, arg2,...
	 * @return Function
	 */
	ns._bind = function(/* func, scope, arg1, arg2 */){
		var args, func, scope;
		args = [].slice.call(arguments);
		func = args.shift();
		scope = args.shift();
		return function(){
			func.apply(scope, args.concat([].slice.call(arguments)));
		};
	};

	/**
	 * Add event listener to document ready
	 * @param Function callback
	 */
	ns._onReady = function(callback){
		var process = function(){
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
	ns._on = function(el, name, callback){
		if(el.addEventListener){ return el.addEventListener(name, callback, false); }
		if(el.attachEvent){ return el.attachEvent("on" + name, callback); }
	};

	/**
	 * Return object is function or not
	 * @param Mixed o
	 * @return Boolean
	 */
	ns._isFunction = function(o){
		return typeof o === "function";
	};

	/**
	 * Interface
	 */
	win.harvest = function(){
		var args, callback;
		args = [].slice.call(arguments);
		if(ns._isFunction(args[args.length - 1])){
			callback = args.pop();
		}
		ns.loader.load(ns.loader.parse(args), callback);
	};

	/**
	 * Initialize
	 * ----------
	 */
	ns.loader.initialize();

}(window, document));