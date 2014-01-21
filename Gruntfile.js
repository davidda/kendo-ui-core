var META = require("./build/kendo-meta.js");
var PATH = require("path");

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-debug-task');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadTasks('build/grunt/tasks');

    function addSrc(f) {
        return PATH.join("src", f);
    }

    var browsers = ['Chrome'];

    var tests = [ "tests/**/*.js" ];

    var browserOption = grunt.option('browser');
    var testsOption = grunt.option('tests');
    var jqueryOption = grunt.option('jquery');
    var jquery = 'src/jquery.js';

    if (testsOption) {
        tests = [ testsOption ];
    }

    if (jqueryOption) {
        jquery = "http://code.jquery.com/jquery-" + jqueryOption + ".min.js";
    }

    if (browserOption) {
        browsers = [ browserOption ];
    }

    var reporters = [ 'progress' ];

    if (grunt.option('junit-results')) {
        reporters.push('junit');
    }

    var jshint = grunt.file.readJSON('build/grunt/jshint.json');
    var files = grunt.option('files');
    jshint.files = files ? files.split(",") : jshint.files;

    // all files (including subfiles like editor/main.js etc.)
    var allKendoFiles = META.loadAll().map(addSrc);

    // files directly in src/
    var main_kendo_files = META.listKendoFiles().map(addSrc);

    var beforeTestFiles = [
        { pattern: 'styles/**/*.*', watched: true, included: false },
        { pattern: 'tests/router/sandbox.html', watched: true, included: false },
        { pattern: 'tests/window/blank.html', watched: true, included: false },
        { pattern: 'tests/editor/editorStyles.css', included: false },
        { pattern: 'tests/**/*-fixture.html' },
        { pattern: 'demos/mvc/App_Data/*json', included: false },
        jquery,
        'tests/jquery.mockjax.js',
    ];

    var afterTestFiles = [
        'src/kendo.timezones.js',
        'src/cultures/kendo.culture.de-DE.js',
        'src/cultures/kendo.culture.bg-BG.js',
        'src/cultures/kendo.culture.en-ZA.js',
        "src/cultures/kendo.culture.es-ES.js",

        'tests/kendo-test-helpers.js',
        'tests/**/test-helper.js',
        'demos/mvc/content/mobilethemebuilder/scripts/colorengine.js',
        'demos/mvc/content/mobilethemebuilder/scripts/gradientengine.js',

        'tests/chart/util.js',
        'tests/map/util.js',

        'themebuilder/scripts/themebuilder.js',

        'tests/chart/util.js',
        'tests/upload/helper.js',
        'tests/upload/select.js',
        'tests/upload/selection.js',
        'tests/upload/async.js',
        'tests/upload/asyncnomultiple.js',
        'tests/upload/asyncnoauto.js',
        'tests/upload/upload.js',
        'tests/upload/success.js',
        'tests/upload/error.js',
        'tests/upload/cancel.js',
        'tests/upload/remove.js',

        { pattern: 'src/kendo.editor.js', included: false }, // download builder needs this
        { pattern: 'src/kendo.aspnetmvc.js', included: false }, // download builder needs this

        'download-builder/scripts/script-resolver.js',
        'tests/diagram/common.js'
    ];

    var compiledStyleSheets = [
        'dist/styles/mobile/kendo.mobile.all.css',
        'dist/styles/web/kendo.common.css',
        'dist/styles/dataviz/kendo.dataviz.css',
        'dist/styles/web/kendo.rtl.css'
    ];

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        jshint: jshint,
        karma: {
            options: {
                browserStack: {
                  username: 'petyoivanov',
                  accessKey: 'QBgixFUrxrEQyY2nKVqb'
                },
                sauceLabs: {
                    username: 'petyosi',
                    accessKey: '2e136bfe-8507-4ac2-b201-1c2f53003669',
                    startConnect: true,
                    testName: 'zergling'
                },
                customLaunchers: {
                    bs_chrome: {
                        base: 'BrowserStack',
                        browser: 'chrome',
                        browser_version: 'latest',
                        os: 'OS X',
                        os_version: 'Mavericks'
                    },
                    sl_chrome: {
                        base: 'SauceLabs',
                        browserName: 'chrome',
                        version: '31'
                    }
                },
                reportSlowerThan: 500,
                basePath: '',
                frameworks: ['qunit'],
                preprocessors: {
                    'tests/**/.html': [],
                    'tests/**/*-fixture.html': ['html2js'],
                },
                reporters: ['progress'],
                colors: true,
                autoWatch: true,
                browsers: browsers,
                captureTimeout: 60000,
                browserNoActivityTimeout: 30000,
                singleRun: grunt.option('single-run')
            },
            ci: {
                options: {
                    reporters: ['progress', 'junit'],

                    junitReporter: {
                      outputFile: grunt.option('junit-results')
                    },

                    singleRun: true,
                    files: beforeTestFiles.concat([ 'dist/js/kendo.all.min.js', 'dist/js/kendo.aspnetmvc.min.js' ]).concat(compiledStyleSheets).concat(afterTestFiles).concat(tests)
                }
            },
            unit: {
                options: {
                    files: beforeTestFiles.concat(allKendoFiles).concat(afterTestFiles).concat(['demos/mvc/content/shared/js/less.js']).concat(tests)
                }
            }
        },

        copy: {
            jquery: {
                files: [{
                    expand: true,
                    cwd: "src/",
                    src: [ "jquery.*" ],
                    dest: '<%= kendo.options.jsDestDir %>/',
                }]
            },
            timezones: {
                files: [{
                    expand: true,
                    cwd: "src/",
                    src: "kendo.timezones.js" ,
                    dest: '<%= kendo.options.jsDestDir %>/',
                }]
            },
            css_assets: {
                files: [{
                    expand: true,
                    cwd: "styles",
                    src: ["**/*.less", "**/*.woff", "**/*.ttf", "**/*.png", "**/*.gif", "**/*.css" ],
                    dest: '<%= kendo.options.stylesDestDir %>/',
                }]
            }
        },

        kendo: {
            options: {
                destDir: "dist",
                jsDestDir: PATH.join("dist", "js"),
                stylesDestDir: PATH.join("dist", "styles")
            },
            min: {
                src: main_kendo_files,
                dest: "<%= kendo.options.jsDestDir %>",
                ext: ".min.js",
            },
            full: {
                src: main_kendo_files,
                dest: "<%= kendo.options.jsDestDir %>",
                ext: ".js",
            },
            download_builder: {
                src: main_kendo_files,
                ext: ".min.js",
                dest: PATH.join("dist", "download-builder", "js"),
            },
            config: {
                src: main_kendo_files,
                dest: "download-builder/config/kendo-config.json"
            },
            cultures: {
                src: [ "src/cultures/kendo.culture.*.js",
                       "!src/cultures/kendo.culture.*.min.js" ],
                dest: "<%= kendo.options.jsDestDir %>/cultures",
            },
        },

        custom: {
            options: {
                destDir: "<%= kendo.options.jsDestDir %>",
            },
        },

        less: {
            options: {
                destDir: "<%= kendo.options.destDir %>",
            },
            compile: {
                src: [ "styles/**/kendo*.less" ],
            }
        },

        license: {
            apply: {
                src:  [ "<%= kendo.options.destDir %>/**/*" ],
                filter: function(src) {
                    return PATH.basename(src).match(/^kendo(.+)(js|css|less)$/);
                }
            }
        }

    });

    // Default task(s).
    grunt.registerTask('default', ['karma:unit']);
    grunt.registerTask("ci", [ 'kendo', 'styles', 'copy:jquery', 'copy:timezones', 'karma:ci' ]);
    grunt.registerTask('tests', [ 'karma:unit' ]);
    grunt.registerTask('styles', [ 'copy:css_assets', 'less' ]);
    grunt.registerTask('all', [ 'kendo', 'copy:jquery', 'copy:timezones' ]);
    grunt.registerTask('build', [ 'all', 'styles', 'license' ]);
};
