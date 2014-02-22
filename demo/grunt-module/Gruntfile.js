
module.exports = function(grunt){

    var harvest = require("../../lib/harvest").init("assets/js/map.json");

    grunt.initConfig({
        concat: {
            demo: {
                files: harvest.files()
            }
        },
        uglify: {
            demo: {
                files: harvest.suffix(".min")
            }
        },
        watch: {
            demo: {
                files: harvest.watch(),
                tasks: ["concat", "uglify"]
            }
        }

    });

    grunt.registerTask("default", []);

    grunt.loadTasks("../../node_modules/grunt-contrib-uglify/tasks");
    grunt.loadTasks("../../node_modules/grunt-contrib-concat/tasks");
    grunt.loadTasks("../../node_modules/grunt-contrib-watch/tasks");
    
};