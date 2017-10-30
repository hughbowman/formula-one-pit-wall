var gulp = require('gulp'),
	fs = require('fs'),
	del = require('del'),
	path = require('path'),
	gulpif = require('gulp-if'),
	gutil = require('gulp-util'),
	gulpImports = require('gulp-imports'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-sass'),
	sassGlob = require('gulp-sass-glob'),
	cssnano = require('gulp-cssnano'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	notify = require('gulp-notify'),
	autoprefixer = require('gulp-autoprefixer'),
	svgstore = require('gulp-svgstore'),
	inject = require('gulp-inject'),
	svgmin = require('gulp-svgmin'),
	imagemin = require('gulp-imagemin'),
	cheerio = require('gulp-cheerio'),
	plumber = require('gulp-plumber'),
	data = require('gulp-data'),
	fileinclude = require('gulp-file-include'),
	browserSync = require('browser-sync').create();

var basePaths = {
	src: 'src/',
	dest: 'public/'
};


var config = {
	prod: gutil.env.prod, // use gulp --prod for minification
	sync: gutil.env.sync, // use gulp --sync for browsersync
	paths: {
		scripts: {
			src: basePaths.src + 'scripts/',
			dest: basePaths.dest + 'assets/js/'
		},
		styles: {
			src: basePaths.src + 'styles/',
			dest: basePaths.dest + 'assets/css/'
		},
		templates: {
			src: basePaths.src + 'templates/',
			dest: basePaths.dest
		},
		images: {
			dest: basePaths.dest + 'assets/img/'
		}
	}
};

var onCompileError = function(err) {
	gutil.log(err);
	notify.onError({
		title: "Gulp",
		subtitle: "Compile Error!",
		message: "<%= error.message %>",
		sound: "Beep"
	})(err);
	gutil.log(gutil.colors.red(err));
	// Keep gulp from hanging on this task
	if (typeof this.emit === 'function') this.emit('end')
};

var onJSHintError = function(err) {
	//gutil.log(err);
	notify.onError({
		title: "Gulp",
		subtitle: "JS Error!",
		message: "<%= error.message %>",
		sound: "Beep"
	})(err);
	// Keep gulp from hanging on this task
	if (typeof this.emit === 'function') this.emit('end')
};

gulp.task('build-css', function() {
	return gulp.src(config.paths.styles.src + 'main.scss')
		.pipe(plumber({
			errorHandler: onCompileError
		}))
		// Include sourcemaps if gulp runs with '--type prod'
		.pipe(gulpif(config.prod, sourcemaps.init()))
		// allow @import "sections/*"; in main scss file rather than named imports
		.pipe(sassGlob())
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['> 1%', 'ios_saf 6', 'ie >= 9'],
			map: true
		}))
		// Minify if gulp runs with '--type prod'
		.pipe(gulpif(config.prod, cssnano({
			autoprefixer: false
		})))
		.pipe(gulpif(config.prod, sourcemaps.write('.')))
		.pipe(config.prod ? rename('styles.min.css') : rename('styles.css'))
		.pipe(gulp.dest(config.paths.styles.dest))
		// .pipe(gulp.dest('../cengage-ecollection/src/'))
		.pipe(notify('SASS Complete'))
		.pipe(gulpif(!config.prod, browserSync.stream()));
});

gulp.task('jshint', function() {
	return gulp.src(config.paths.scripts.src + 'components/**/*.js')
		.pipe(plumber({
			errorHandler: onJSHintError
		}))
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'))
		.on('error', notify.onError({
			message: 'JS hint fail'
		}));
});

gulp.task('build-js-dependencies', function() {
	return gulp.src(config.paths.scripts.src + 'dependencies.js')
		.pipe(plumber({
			errorHandler: onCompileError
		}))
		.pipe(gulpif(config.prod, sourcemaps.init()))
		.pipe(gulpImports())
		.pipe(concat('dependencies.js'))
		// Uglify if gulp runs with '--prod'
		.pipe(gulpif(config.prod, uglify()))
		.pipe(gulpif(config.prod, sourcemaps.write('.')))
		.pipe(gulpif(config.prod, rename('dependencies.min.js')))
		.pipe(gulp.dest(config.paths.scripts.dest))
		.pipe(notify('JS Dependencies Complete'))
		.pipe(gulpif(!config.prod, browserSync.stream()));
});

gulp.task('build-js-components', function() {
	return gulp.src(config.paths.scripts.src + 'components.js')
		.pipe(plumber({
			errorHandler: onCompileError
		}))
		.pipe(gulpif(config.prod, sourcemaps.init()))
		.pipe(gulpImports())
		// Uglify if gulp runs with '--prod'
		.pipe(gulpif(config.prod, uglify()))
		.pipe(gulpif(config.prod, sourcemaps.write('.')))
		.pipe(rename('scripts.js'))
		.pipe(config.prod ? rename('scripts.min.js') : rename('scripts.js'))
		.pipe(gulp.dest(config.paths.scripts.dest))
		.pipe(notify('JS Components Complete'))
		.pipe(gulpif(!config.prod, browserSync.stream()));
});

gulp.task('images', function() {
	// currently dest since we don't keep any in src generally to avoid duplication
	return gulp.src(config.paths.images.dest + '**/*.{jpg, png, gif}')
		.pipe(imagemin())
		.pipe(gulp.dest(config.paths.images.dest))
		.pipe(notify('Images minified'))
		.pipe(gulpif(!config.prod, browserSync.stream()));
})

// minifies and copies svgs from src -> dest
gulp.task('svgmin', function() {
	return gulp.src(basePaths.src + 'svg/**/*.svg')
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe(gulp.dest(config.paths.images.dest + 'svg/'));
});
gulp.task('svgstore', ['svgmin'], function() {
	return gulp.src(config.paths.images.dest + 'svg/*.svg')
		.pipe(svgstore({
			inlineSvg: true
		}))
		.pipe(cheerio({
			parserOptions: {
				xmlMode: true
			},
			run: function($, file) {
				$('svg').attr({
					style: 'height: 0; width: 0; position: absolute; visibility: hidden;',
					tabindex: '-1'
				});
				$('symbol').attr('preserveAspectRatio', 'xMinYMin slice');
			}
		}))
		.pipe(rename('head-svg-symbols.html'))
		.pipe(gulp.dest(config.paths.templates.src + 'snippets/'))
		.pipe(notify('SVG Complete'));
});

gulp.task('templates', ['svgstore'], function() {

	return gulp.src(config.paths.templates.src + 'index.html')
		// .pipe(data(getData))
		.on('error', onCompileError)
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(rename('index.html'))
		.pipe(notify('Templates Complete'))
		.pipe(gulp.dest(config.paths.templates.dest))
		.pipe(gulpif(!config.prod, browserSync.stream()));
});

gulp.task('watch', function() {
	gulp.watch(config.paths.scripts.src + '**/*.js', ['jshint', 'build-js']);
	gulp.watch(config.paths.styles.src + '**/*.scss', ['build-css']);
	gulp.watch(basePaths.src + 'svg/**/*.svg', ['svgstore']);
	gulp.watch(config.paths.templates.src + "**/*.html", ['templates']);

	if (config.sync) {
		browserSync.init({
			open: true,
			server: './',
			// proxy: 'project.local'
			port: 8042,
			startPath: basePaths.src + 'stylefile.html',
			ui: {
				port: 9042
			}
		});
	}
})

// only watch when not using --prod
var defaultTasks = ['build-css', 'build-js', 'templates'];
if (!config.prod) defaultTasks.push('watch');

gulp.task('default', defaultTasks);
gulp.task('build-js', ['jshint', 'build-js-dependencies', 'build-js-components']);
