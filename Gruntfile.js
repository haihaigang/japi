module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            deploy: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**',
                    dest: 'dest'
                }]
            }
        },
        transport: {
            example: {
                options: {
                    // 是否采用相对地址
                    relative: true,
                    // 生成具名函数的id的格式 默认值为 {{family}}/{{name}}/{{version}}/{{filename}}
                    format: '../static/{{filename}}',
                },
                files: [{
                    // 相对路径地址
                    cwd: 'dest/',
                    // 需要生成具名函数的文件集合
                    src: 'app/**/*.js',
                    // 生成存放的文件目录。里面的目录结构与 src 里各个文件名带有的目录结构保持一致
                    dest: '.build'
                }]
            },
            deploy: {
                options: {
                    paths: ['framework'],
                    debug: false,
                    idleading: './app/',
                    alias0: {
                        "jquery": "jquery-1.11.3.js",
                        "angular": "angular-1.3.0.14/angular.js",
                        "angular-animate": "angular-1.3.0.14/angular-animate.js",
                        "angular-ui-router": "angular-ui-router.js",
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dest/app/',
                    src: ['**/*.js'],
                    dest: 'dest/.build'
                }]
            }
        },
        concat: {
            options: {
                //separator: ';'
            },
            allInOne: { //所有JS文件全部合并成一份文件
                src: ['src/**/*.js'],
                dest: 'dest/src-concated/js/<%= pkg.name %>.js'
            },
            deploy: {
                src: ['dest/.build/**/*.js'],
                dest: 'dest/app/main.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            buildrelease: {
                options: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    },
                    report: "min" //输出压缩率，可选的值有 false(不输出信息)，gzip
                },
                files: [{
                    expand: true,
                    cwd: 'dest/src-concated/js', //js目录
                    src: '**/*.js', //所有js文件
                    dest: 'dest/release/js', //输出到此目录下
                    ext: '.min.js' //指定扩展名
                }]
            },
            buildsrc: { //按照原来的目录结构压缩所有JS文件
                options: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    },
                    report: "min" //输出压缩率，可选的值有 false(不输出信息)，gzip
                },
                files: [{
                    expand: true,
                    cwd: 'src', //js目录
                    src: '**/*.js', //所有js文件
                    dest: 'dest/src-min', //输出到此目录下
                    ext: '.min.js' //指定扩展名
                }]
            },
            deploy: { //按照原来的目录结构压缩所有JS文件
                options: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    },
                    report: "min" //输出压缩率，可选的值有 false(不输出信息)，gzip
                },
                files: [{
                    expand: true,
                    cwd: 'dest/app', //js目录
                    src: '**/*.js', //所有js文件
                    dest: 'dest/app', //输出到此目录下
                    ext: '.min.js' //指定扩展名
                }]
            }
        },
        watch: {
            javascript: {
                files: ['src/js/**/*.js'],
                tasks: ['concat:allInOne', 'uglify:buildsrc', 'uglify:buildrelease'],
                options: {
                    spawn: true,
                    interrupt: true
                }
            }
        },
        clean: {
            deploy: ['dest/app/**/*.js', 'dest/.build', '!dest/app/main.js']
        }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['concat', 'uglify']);

    grunt.registerTask('wiwiy', ['copy:deploy', 'transport:deploy', 'concat:deploy', 'clean:deploy']);

    grunt.registerTask('abc', ['uglify:deploy']);
};
