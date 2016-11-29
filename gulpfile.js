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
var concat = require('gulp-concat');


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

var meter = {tagName: 'METER', interface: 'HTMLMeterElement'};
var polyfillMeter = {tagName: 'FMETER', interface: 'HTMLFakeMeterElement'};

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

function getPolyfillJS(meter) {
  return gulp.src([
    'src/intro.js',
    'src/polyfill.js',
    'src/outro.js',
    ])
    .pipe(concat(pkg.name + '.js'))
    .pipe(replace('<%= METER_TAG_NAME %>', meter.tagName))
    .pipe(replace('<%= METER_INTERFACE %>', meter.interface))
    .pipe(replace('<%= VERSION %>', pkg.version))
    ;
}

gulp.task('scripts:min', function() {
  return getPolyfillJS(meter)
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
  return getPolyfillJS(meter)
    .pipe(rename(pkg.name + '.js'))
    .pipe(header(banner, {pkg}))
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'scripts'}));
});

gulp.task('styles:min', function() {
  return gulp.src('src/polyfill.scss')
    .pipe(replace('<%= METER_TAG_NAME %>', meter.tagName.toLowerCase()))
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
    .pipe(replace('<%= METER_TAG_NAME %>', meter.tagName.toLowerCase()))
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
      addComment: false
    }))
    .pipe(gulp.dest('dist'))
    .pipe(size({title: 'styles'}));
});

gulp.task('release', ['scripts:release','scripts:min', 'styles:release', 'styles:min'], function() {
});

[polyfillMeter, meter].forEach(function(meter) {
  var tagNameLower = meter.tagName.toLowerCase();
  var dist = 'test/' + tagNameLower;
  gulp.task('test:scss-' + tagNameLower, function() {
    return gulp.src('src/**/*.scss')
      .pipe(flatten())
      .pipe(replace('<%= METER_TAG_NAME %>', tagNameLower))
      .pipe(replace('<%= VERSION %>', pkg.version))
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sass({
        outputStyle: 'expanded',
        precision: 10,
        onError: console.error.bind(console, 'Sass error:')
      }))
      .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dist))
      .pipe(size({title: 'styles'}))
      .pipe(browserSync.stream());
  });

  gulp.task('test:script-' + tagNameLower, function() {
    return gulp.src('src/test/*.js')
      .pipe(replace('<%= METER_TAG_NAME %>', meter.tagName))
      .pipe(replace('<%= METER_INTERFACE %>', meter.interface))
      .pipe(replace('<%= VERSION %>', pkg.version))
      .pipe(flatten())
      .pipe(gulp.dest(dist))
      .pipe(size({title: 'script'}))
      .pipe(browserSync.stream());
  });

  gulp.task('test:script-polyfill-' + tagNameLower, function() {
    return getPolyfillJS(meter)
      .pipe(rename('polyfill.js'))
      .pipe(flatten())
      .pipe(gulp.dest(dist))
      .pipe(size({title: 'script-polyfill'}))
      .pipe(browserSync.stream());
  });

  gulp.task('test:script-polyfill-min-' + tagNameLower, function() {
    return getPolyfillJS(meter)
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

  gulp.task('test:html-' + tagNameLower, function() {
    return gulp.src('src/test/*.html')
      .pipe(replace('<%= METER_TAG_NAME %>', meter.tagName))
      .pipe(replace('<%= METER_INTERFACE %>', meter.interface))
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
      baseDir: './test/fmeter/',
      index: 'meter.html'
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
[polyfillMeter, meter].forEach(function(meter) {
  var tagNameLower = meter.tagName.toLowerCase();
  tasks = tasks.concat([
    'test:scss-' + tagNameLower,
    'test:script-' + tagNameLower,
    'test:script-polyfill-' + tagNameLower,
    'test:script-polyfill-min-' + tagNameLower,
    'test:html-' + tagNameLower,
  ]);
});

gulp.task('test', tasks);

gulp.task('default', tasks.concat(['test:server']), function() {
  var tagNameLower = meter.tagName.toLowerCase();
  var polyfilltagNameLower = polyfillMeter.tagName.toLowerCase();
  gulp.watch('src/**/*.scss', [
    'test:scss-' + tagNameLower,
    'test:scss-' + polyfilltagNameLower
  ]);

  gulp.watch('src/**/*.js', [
    'test:script-' + tagNameLower,
    'test:script-' + polyfilltagNameLower,
  ]);

  gulp.watch('src/**/*.html', [
    'test:html-' + tagNameLower,
    'test:html-' + polyfilltagNameLower,
  ]);

  gulp.watch('src/polyfill.js', [
    'test:script-polyfill-' + tagNameLower,
    'test:script-polyfill-' + polyfilltagNameLower,
    'test:script-polyfill-min-' + tagNameLower,
    'test:script-polyfill-min-' + polyfilltagNameLower,
  ]);
});
