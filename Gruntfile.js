
module.exports = function(grunt){

    grunt.loadTasks("tasks");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");

    var banner = grunt.template.process(
        grunt.file.read("src/banner.js"), 
        {data: grunt.file.readJSON("package.json")}
    );

    grunt.initConfig({
        concat: {
            dist: {
                options: { banner: banner },
                files: {
                    "dist/harvest.js": "src/harvest.js"
                }
            }
        },
        uglify: {
            dist: {
                options: { banner: banner },
                files: {
                    "dist/harvest.min.js": "src/harvest.js"
                }
            }
        },
        harvest: {
            options: {
                path: "demo/unify/js",
                banner: "/* build: <%=grunt.template.today('yyyy/mm/dd') %> */\n"
            },
            demo_unify: {
                options: {
                    uglify: false
                },
                files: {
                    "demo/unify/js/main.unify.js": "demo/unify/js/main.js"
                }
            },
            demo_minify: {
                files: {
                    "demo/unify/js/main.minify.js": "demo/unify/js/main.js"
                }
            }
        }
    });


    grunt.registerTask("default", ["concat:dist", "uglify:dist"]);

};