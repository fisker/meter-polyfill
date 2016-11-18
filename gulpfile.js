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
var flatten = require('gulp-flatten');
var replace = require('gulp-replace');
var browserSync = require('browser-sync').create();


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

var polyfillMeterTag = 'FAKEMETER';

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
    .pipe(replace('<%= METER_TAG %>', 'METER'))
    .pipe(replace('<%= VERSION %>', pkg.version))
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
    .pipe(replace('<%= METER_TAG %>', 'METER'))
    .pipe(replace('<%= VERSION %>', pkg.version))
    .pipe(header(banner, {pkg}))
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'scripts'}));
});

gulp.task('styles:min', function() {
  return gulp.src('src/polyfill.scss')
    .pipe(replace('<%= METER_TAG %>', 'meter'))
    .pipe(replace('<%= VERSION %>', pkg.version))
    .pipe(rename(pkg.name + '.min.scss'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass({
      outputStyle: 'expanded',
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
    .pipe(replace('<%= METER_TAG %>', 'meter'))
    .pipe(replace('<%= VERSION %>', pkg.version))
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

[polyfillMeterTag, 'METER'].forEach(function(polyfillMeterTag) {
  var dist = 'test/' + polyfillMeterTag.toLowerCase();
  gulp.task('test:scss-' + polyfillMeterTag.toLowerCase(), function() {
    return gulp.src('src/**/*.scss')
      .pipe(flatten())
      .pipe(replace('<%= METER_TAG %>', polyfillMeterTag.toLowerCase()))
      .pipe(replace('<%= VERSION %>', pkg.version))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sass({
        precision: 10,
        onError: console.error.bind(console, 'Sass error:')
      }))
      .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dist))
      .pipe(size({title: 'styles'}))
      .pipe(browserSync.stream());
  });

  gulp.task('test:script-' + polyfillMeterTag.toLowerCase(), function() {
    return gulp.src('src/**/*.js')
      .pipe(replace('<%= METER_TAG %>', polyfillMeterTag))
      .pipe(replace('<%= VERSION %>', pkg.version))
      .pipe(flatten())
      .pipe(gulp.dest(dist))
      .pipe(size({title: 'script'}))
      .pipe(browserSync.stream());
  });

  gulp.task('test:script-polyfill-' + polyfillMeterTag.toLowerCase(), function() {
    return gulp.src('src/polyfill.js')
      .pipe(replace('<%= METER_TAG %>', polyfillMeterTag))
      .pipe(replace('<%= VERSION %>', pkg.version))
      .pipe(rename('polyfill.js'))
      .pipe(flatten())
      .pipe(gulp.dest(dist))
      .pipe(size({title: 'script-polyfill'}))
      .pipe(browserSync.stream());
  });

  gulp.task('test:script-polyfill-min-' + polyfillMeterTag.toLowerCase(), function() {
    return gulp.src('src/polyfill.js')
      .pipe(replace('<%= METER_TAG %>', polyfillMeterTag))
      .pipe(replace('<%= VERSION %>', pkg.version))
      .pipe(rename('polyfill.min.js'))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(
        uglify(uglifyjsOpts)
        .on('error', console.error.bind(console, 'UglifyJS error:'))
      )
      .pipe(flatten())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dist))
      .pipe(size({title: 'script-polyfill-min'}))
      .pipe(browserSync.stream());
  });

  gulp.task('test:html-' + polyfillMeterTag.toLowerCase(), function() {
    return gulp.src('src/**/*.html')
      .pipe(replace('<%= METER_TAG %>', polyfillMeterTag))
      .pipe(replace('<%= VERSION %>', pkg.version))
      .pipe(flatten())
      .pipe(gulp.dest(dist))
      .pipe(size({title: 'test:html'}))
      .pipe(browserSync.stream());
  });
});


gulp.task('test:server', function() {
  browserSync.init({
    server: {
      baseDir: './test/'
    }
  });

  // return gulp.src('./')
  //   .pipe(server({
  //     livereload: true,
  //     directoryListing: true,
  //     open: true
  //   }));
});

var tasks = [];
[polyfillMeterTag, 'METER'].forEach(function(polyfillMeterTag) {
  tasks = tasks.concat([
    'test:scss-' + polyfillMeterTag.toLowerCase(),
    'test:script-' + polyfillMeterTag.toLowerCase(),
    'test:script-polyfill-' + polyfillMeterTag.toLowerCase(),
    'test:script-polyfill-min-' + polyfillMeterTag.toLowerCase(),
    'test:html-' + polyfillMeterTag.toLowerCase(),
  ]);
});
tasks = tasks.concat(['test:server']);

gulp.task('test', tasks, function() {
  gulp.watch('src/**/*.scss', [
    'test:scss-meter',
    'test:scss-' + polyfillMeterTag.toLowerCase()
  ]);
  gulp.watch('src/**/*.js', [
    'test:script-meter',
    'test:script-' + polyfillMeterTag.toLowerCase(),
  ]);

  gulp.watch('src/polyfill.js', [
    'test:script-polyfill-meter',
    'test:script-polyfill-' + polyfillMeterTag.toLowerCase(),
  ]);

  gulp.watch('src/**/*.html', [
    'test:html-meter',
    'test:html-' + polyfillMeterTag.toLowerCase(),
  ]);
});

gulp.task('default', ['test']);
