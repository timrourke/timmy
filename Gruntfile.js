module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			dist: {
				src: [
					'frontend/js/libs/*.js',
					'frontend/js/*.js'
				],
				dest: 'public/js/build/global.js',
			}
		},
		uglify: {
			build: {
				src: 'public/js/build/global.js',
				dest: 'public/js/build/global.min.js'
			}
		},
		responsive_images: {
			myTask: {
				options: {
					quality: 60,
					createNoScaledImage: true,
					sizes: [{
						width: '100%',
						rename: false,
						quality: 60
					},{
						width: 320
					},{
						width: 640
					},{
						width: 1024
					}]
			},
			files: [{
				expand: true,
				cwd: 'frontend/img/',
				src: ['**/*.{jpg,gif,png}'],
				dest: 'public/img-build/'
				}]
			}
		},
		imagemin: {
			dynamic: {
				files: [{
					expand: true,
					cwd: 'public/img-build/',
					src: ['**/*.{png,jpg,gif}'],
					dest: 'public/images/'
				}]
			}
		},
		sass: {
			dist: {
				options: {
					require: 'susy',
					style: 'compressed',
					sourcemap: 'file'
				},
				files: {
					'public/css/style.css': 'frontend/scss/style.scss',
					'public/css/style-ie.css': 'frontend/scss/style-ie.scss'
				}
			}
		},
		svgmin: {
			options: {
				plugins: [
					{
						removeViewBox: false
					}, {
						removeUselessStrokeAndFill: false
					}, {
						removeEmptyAttrs: false
					}, {
						cleanupIDs: false
					}, {
						collapseGroups: false
					}, {
						mergePaths: false
					}
				]
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'frontend/svgs',
					src: ['**/*.svg'],
					dest: 'public/svgs'
				}]
			}
		},
		autoprefixer: {
			options: {
				browsers: ['last 8 versions', 'ie 8', 'ie 9'],
				map: true
			},
			no_dest: {
				src: 'public/css/*.css'
			}
		},
		watch: {
			images: {
				files: ['frontend/img/**/*.*'],
				tasks: ['responsive_images','newer:imagemin'],
				options: {
					spawn: false
				}
			},
			svgs: {
				files: ['frontend/svgs/**/*.*'],
				tasks: ['svgmin'],
				options: {
					spawn: false
				}
			},
			scripts: {
				files: ['frontend/js/**/*.js'],
				tasks: ['concat', 'uglify'],
				options: {
					spawn: false
				},
			},
			css: {
				files: ['frontend/scss/**/*.scss'],
				tasks: ['sass', 'autoprefixer', 'cssmin', 'notify:cssmin'],
				options: {
					spawn: false
				}
			}
		},
		jshint: {
			beforeconcat: ['frontend/js/global.js'],
			options: {
				globals: {
					jQuery: true
				}
			}
		},
		criticalcss: {
			custom: {
				options: {
				url: "http://localhost:3000",
				// arbitrary width and height for critical to use when looking at "above the fold" styles.
				width: 1000,
				height: 800,
				outputfile: "views/critical.css.ejs",
				filename: "public/css/style.css",
				buffer: 800*1024
				}
			}
		},
		cssmin: {
		  options: {
			keepSpecialComments: 0,
			shorthandCompacting: false,
			roundingPrecision: -1
		  },
		  target: {
			files: {
			  'views/critical.min.css.ejs': ['views/critical.css.ejs']
			}
		  }
		},
		notify_hooks: {
			options: {
				enabled: true,
				max_jshint_notifications: 5, // maximum number of notifications from jshint output
				title: "timmy", // defaults to the name in package.json, or will use project directory's name
				success: true, // whether successful grunt executions should be notified automatically
				duration: 3 // the duration of notification in seconds, for `notify-send only
			}
		},
		notify: {
			cssmin: {
				options: {
					title: 'Task Complete',  // optional
					message: 'SASS finished running', //required
				}
			},
			watch: {
				options: {
					title: 'Task Complete',  // optional
					message: 'Server is ready!', //required
				}
			}
		},
		browserSync: {
			dev: {
				bsFiles: {
					src : [
						'public/css/*.css',
						'public/js/build/**',
						'public/js/vendor/**',
						'views/**/*.ejs'
					]
				},
				options: {
					watchTask: true,
					proxy: 'localhost:3000',
					notify: false
				}
			}
		}


	});

	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-responsive-images');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-notify');
	grunt.loadNpmTasks('grunt-svgmin');
	grunt.loadNpmTasks('grunt-criticalcss');
	grunt.loadNpmTasks('grunt-contrib-cssmin');

	grunt.task.run('notify_hooks');

	grunt.registerTask('default', ['sass', 'autoprefixer', 'cssmin', 'notify:cssmin', 'jshint', 'concat', 'uglify', 'newer:svgmin', 'newer:responsive_images', 'newer:imagemin', 'browserSync', 'watch', 'notify:watch']);

	grunt.registerTask('criticalcss', ['criticalcss']);

};