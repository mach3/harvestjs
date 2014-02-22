
module.exports = function(grunt){

    grunt.registerTask("default", []);

    grunt.initConfig({
        harvest: {
            options: {
                path: "js",
                banner: "/* build: <%=grunt.template.today('yyyy/mm/dd') %> */\n"
            },
            demo_concat: {
                options: {
                    uglify: false
                },
                files: {
                    "js/main.uni.js": "js/main.js"
                }
            },
            demo_minify: {
                options: {
                    uglify: true
                },
                files: {
                    "js/main.min.js": "js/main.js"
                }
            }
        }
    });

    grunt.loadTasks("../../tasks");

};