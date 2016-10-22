var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var watchify = require('watchify');

var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @license <%= pkg.license %>',
  ' * @copyright <%= pkg.author %>',
  ' * @link https://github.com/fisker/meter-polyfill',
  ' */',
  ''].join('\n');
var $ = require('gulp-load-plugins')();

var AUTOPREFIXER_BROWSERS = [
  'ie >= 9',
  'ie_mob >= 1',
  'ff >= 1',
  'chrome >= 1',
  'safari >= 1',
  'opera >= 1',
  'ios >= 1',
  'android >= 1',
  'bb >= 1'
];


function handleErrors() {
  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);
  this.emit('end'); // Keep gulp from hanging on this task
}

function buildScript(file, watch) {
  var props = {
    entries: ['./src/js/' + file],
    debug : true,
    transform:  [babelify.configure({presets: ["es2015"]})]
  };

  // watchify() if watch requested, otherwise run browserify() once
  var bundler = watch ? watchify(browserify(props)) : browserify(props);

  function rebundle() {
    var stream = bundler.bundle();
    return stream
      .on('error', handleErrors)
      .pipe(source(file))
      .pipe(gulp.dest('./build/js/'))
      // .pipe(buffer())
      // .pipe(uglify())
      // .pipe(rename('app.min.js'))
      // .pipe(gulp.dest('./build'))
      // .pipe(reload({stream:true}))
  }

  // listen for an update and run rebundle
  bundler.on('update', function() {
    rebundle();
    gutil.log('Rebundle...');
  });

  // run it once the first time buildScript is called
  return rebundle();
}

gulp.task('scripts', function() {
  // return buildScript('main.js', false); // this will run once because we set watch to false
});

gulp.task('styles', function() {
  return gulp.src('src/*.scss')
  .pipe($.sourcemaps.init())
  .pipe($.sass({
    precision: 10,
    onError: console.error.bind(console, 'Sass error:')
  }))
  .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
  .pipe($.header(banner, {pkg}))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('dist'))
  .pipe($.size({title: 'styles'}));
});

gulp.task('default', ['scripts', 'styles'], function() {
  gulp.watch('src/*', ['styles']); // gulp watch for stylus changes
  return buildScript('main.js', true); // browserify watch for JS changes
});
