# HarvestJS (working)

Simple script loader and compiler

## Feature

- Multiple script loader
- Compiler to concat and minify scritps for grunt
- Compile helper module for grunt

## Script Loader

### Loading

This will load "js/main.js" when DOM is ready.

```html
<script src="vendors/harvest.js" 
    data-path="js/" 
    data-main="main.js"
    ></script>
```

- *data-path* : The path to script's root directory  
  (If ommitted, set as the path where harvest.js is saved)
- *data-main* : Start loading the scripts when DOM is ready  
  (comma/space separated string for multiple sources)


### harvest()

You may use `harvest()` function to load sub-resources in "init.js" or "main.js"

```javascript
// main.js
harvest(
    "../vendors/jquery.js",
    "../vendors/backbone.js",
    "../vendors/underscore.js",
    "app/myapp.js"
);
```
These paths should be relative to script's root directory (data-path).

### harvest() with callback

If you pass function as last argument, the callback will be called when all script is loaded.

```javascript
harvest(
    "../vendors/jquery.js",
    "../vendors/backbone.js",
    "../vendors/underscore.js",
    function(){
        // do something
    }
);
```

But compiler doesn't support unifying the script with callback.

## Compiler (Grunt Task)

Compiler as grunt task will help you to concat or minify scripts.

```javascript
grunt.loadNpmTasks("harvestjs");

// or 
// grunt.loadTasks("the/path/to/harvestjs/tasks");

grunt.initConfig({
    harvest: {
        options: {
            path: "js/",
            banner: "/* <%= grunt.format.today('yyyy-mm-dd') %> */",
            uglify: {}
        },
        dist: {
            files: {
                "js/main.unified.js": "js/main.js"
            }
        }
    }
});

```

### Options

- **path:String** ("") - The script root path
- **banner:String** ("") - Banner string to be prepended to unified script
- **uglify:Object** ({}) - UglifyJS2's compress options (Pass `false` not to minify script)


## Helper (Grunt Module)

Grunt module will help you to configure grunt-contib-concat, grunt-contrib-uglify, grunt-contrib-watch
or some tasks which accept 'files' section.
You may just pass the JSON file path which includes information about unification.


This feature doesn't accept any `harvest()` in sources,
but just follow settings in JSON passed.


```
var harvest = require("harvestjs");
var conf = harvest.init("assets/js/map.json");

grunt.initConfig({
    concat: {
        dist: {
            // files() returns a files object
            files: harvest.files();
        }
    },
    uglify: {
        dist: {
            // suffix() returns a files object with suffix
            files: harvest.suffix(".min");
        }
    },
    watch: {
        dist: {
            // watch() returns an array of files to watch
            files: harvest.watch(),
            tasks: ["concat", "uglify"]
        }
    }
});
``` 

- **init(json_path:String):Harvest** - Get instance by JSON path
- **files():Object** - Returns a files object
- **suffix(suffix:String):Object** - Returns a files object with suffix
- **watch():Array** - Returns a files array for watch task


JSON may be like below.

```
{
    "watch": ["*/**/*.js"],
    "files": {
        "vendors.js": ["../vendors/jquery/jquery.js", "../vendors/underscore/underscore.js"],
        "lib.js": ["lib/foo.js", "lib/bar.js", "lib/baz.js"],
        "main.js": ["app/init.js"]
    }
}
```

All paths in JSON must be relative to JSON file itself.
Harvest resolve them to relative paths to the project root (Gruntfile.js saved).




