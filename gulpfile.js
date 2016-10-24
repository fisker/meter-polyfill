var gulp = require('gulp');
var watchify = require('watchify');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var header = require('gulp-header');
var sourcemaps = require('gulp-sourcemaps');
var size = require('gulp-size');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var uglifyjs = require('uglify-js');
var minifier = require('gulp-uglify/minifier');
var server = require('gulp-server-livereload');
var flatten = require('gulp-flatten');

var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @license <%= pkg.license %>',
  ' * @copyright <%= pkg.author.name %>',
  ' * @link <%= pkg.homepage %>',
  ' */',
  ''].join('\n');

var year = new Date().getFullYear();
var banner_min = '/* <%= pkg.name %> v<%= pkg.version %> | (c) ' + year + ' <%= pkg.author.name %> | <%= pkg.license %> License */\n';

var AUTOPREFIXER_BROWSERS = [
  'ie >= 6',
  'ie_mob >= 1',
  'ff >= 1',
  'chrome >= 1',
  'safari >= 1',
  'opera >= 1',
  'ios >= 1',
  'android >= 1',
  'bb >= 1'
];

var uglifyjsOpts = {
  compress: {
    global_defs: {
      DEBUG: false
    },
    unused: false,
    screw_ie8: false,
    keep_fnames: true,
  }
};


gulp.task('scripts:min', function() {
  return gulp.src('src/polyfill.js')
    .pipe(rename(pkg.name + '.min.js'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(
      uglify(uglifyjsOpts)
      .on('error', console.error.bind(console, 'UglifyJS error:'))
    )  // buggy
    .pipe(header(banner_min, {pkg}))
    .pipe(sourcemaps.write('./maps', {
      addComment: false
    }))
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'scripts'}));
});

gulp.task('scripts:release', function() {
  return gulp.src('src/polyfill.js')
    .pipe(rename(pkg.name + '.js'))
    .pipe(header(banner, {pkg}))
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'scripts'}));
});

gulp.task('styles:min', function() {
  return gulp.src('src/polyfill.scss')
    .pipe(rename(pkg.name + '.min.scss'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass({
      outputStyle: 'compact',
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(header(banner_min, {pkg}))
    .pipe(sourcemaps.write('./maps', {
      addComment: false
    }))
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'styles'}));
});

gulp.task('styles:release', function() {
  return gulp.src('src/polyfill.scss')
    .pipe(rename(pkg.name + '.scss'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass({
      outputStyle: 'expanded',
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(header(banner, {pkg}))
    .pipe(sourcemaps.write('./maps', {
      // addComment: false
    }))
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'styles'}));
});

gulp.task('release', ['scripts:release','scripts:min', 'styles:release', 'styles:min'], function() {

});

gulp.task('test:scss', function() {
  return gulp.src('src/**/*.scss')
    .pipe(flatten())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('test'))
    .pipe(size({title: 'styles'}));
});

gulp.task('test:misc', function() {
  return gulp.src('src/**/*.{js,html}')
    .pipe(flatten())
    .pipe(gulp.dest('test'))
    .pipe(size({title: 'script'}));
});

gulp.task('test:server', function() {
  return gulp.src('./')
    .pipe(server({
      livereload: true,
      directoryListing: true,
      open: true
    }));

});

gulp.task('test', ['test:scss', 'test:misc', 'test:server'], function() {
  gulp.watch('src/**/*.scss', ['test:scss']);
  gulp.watch('src/**/*.{js,html}', ['test:misc']);
});

gulp.task('default', ['test']);
