# [Deprecated] HarvestJS

Simple script loader and compiler

Now debugging...

## Feature

- Multiple script loader
- Compiler to concat and minify scritps

## Script Loader

### Loading

This will load "js/init.js" immidiately, and load "js/main.js" when DOM is ready.

```html
<script src="vendors/harvest.js" 
    data-path="js/" 
    data-init="init.js" 
    data-main="main.js"
    ></script>
```

- *data-init* : Start loading the scripts right now  
  (comma/space separated string for multiple sources)
- *data-main* : Start loading the scripts when DOM is ready  
  (comma/space separated string for multiple sources)
- *data-path* : The path to script's root directory  
  (If ommitted, set as the path where harvest.js is saved)


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

## Compiler

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

- path:String ("") = The script root path
- banner:String ("") = Banner string to be prepended to unified script
- uglify:Object ({}) = UglifyJS2's compress options (Pass `false` not to minify script)



