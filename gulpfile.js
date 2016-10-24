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
var browserSync = require('browser-sync');
var uglifyjs = require('uglify-js');
var minifier = require('gulp-uglify/minifier');

var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @license <%= pkg.license %>',
  ' * @copyright <%= pkg.author %>',
  ' * @link <%= pkg.homepage %>',
  ' */',
  ''].join('\n');

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
    screw_ie8: false,
    support_ie8: true
  }
};

gulp.task('scripts', function() {
  return gulp.src('src/polyfill.js')
    .pipe(rename(pkg.name+'.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify(uglifyjsOpts))// buggy
    // .pipe(minifier(uglifyjsOpts, uglifyjs))
    .pipe(header(banner, {pkg}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'scripts'}))
    .pipe(browserSync.stream());
});

gulp.task('styles', function() {
  return gulp.src('src/polyfill.scss')
    .pipe(rename(pkg.name+'.scss'))
    .pipe(sourcemaps.init())
    .pipe(sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(header(banner, {pkg}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'styles'}))
    .pipe(browserSync.stream());
});

gulp.task('release', ['scripts', 'styles'], function() {

});

gulp.task('default', ['scripts', 'styles'], function() {
  browserSync({
    server: {
      baseDir: "./"
    }
  }, function(err, bs) {
    // console.log(bs.options.urls.local + 'test/test.html');
  });
  gulp.watch('src/polyfill.scss', ['styles']);
  gulp.watch('src/polyfill.js', ['scripts']);
  gulp.watch("index.html").on('change', browserSync.reload);
  gulp.watch("test/*").on('change', browserSync.reload);
  gulp.watch("dist/*").on('change', browserSync.reload);
});
