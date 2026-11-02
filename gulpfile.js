const {src, dest, watch, parallel, series} = require('gulp');
const path = require('path');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const { assembleHtmlFiles } = require('./scripts/html-assembler');

const APP_DIR = 'app';
const BUILD_DIR = 'build';

function browsersync() {
    browserSync.init({
        server: {
            baseDir: BUILD_DIR + '/'
        }
    });
}

function cleanDist() {
    return del('dist');
}

function cleanBuild() {
    return del([BUILD_DIR + '/**', '!' + BUILD_DIR]);
}

function images() {
    return src(APP_DIR + '/images/**/*')
        .pipe(dest('dist/images'));
}

function scripts() {
    return src([
        APP_DIR + '/js/main.js'
    ])
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(dest(APP_DIR + '/js'))
        .pipe(dest(BUILD_DIR + '/js'))
        .pipe(browserSync.stream());
}

function orderNewScripts() {
    return src(APP_DIR + '/js/order_new.js')
        .pipe(uglify())
        .pipe(concat('order_new.min.js'))
        .pipe(dest(APP_DIR + '/js'))
        .pipe(dest(BUILD_DIR + '/js'))
        .pipe(browserSync.stream());
}

function dropScripts() {
    return src([
        APP_DIR + '/js/Drop/drop.js',
        APP_DIR + '/js/Drop/catalog.js'
    ])
        .pipe(uglify())
        .pipe(concat('drop.min.js'))
        .pipe(dest(APP_DIR + '/js/Drop'))
        .pipe(dest(BUILD_DIR + '/js/Drop'))
        .pipe(browserSync.stream());
}

function headerUserMenuScripts() {
    return src(APP_DIR + '/js/header-user-menu.js')
        .pipe(uglify())
        .pipe(concat('header-user-menu.min.js'))
        .pipe(dest(APP_DIR + '/js'))
        .pipe(dest(BUILD_DIR + '/js'))
        .pipe(browserSync.stream());
}

function styles() {
    return src(APP_DIR + '/scss/style.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest(APP_DIR + '/css'))
        .pipe(dest(BUILD_DIR + '/css'))
        .pipe(browserSync.stream());
}

function orderNewStyles() {
    return src(APP_DIR + '/scss/order_new.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(concat('order_new.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest(APP_DIR + '/css'))
        .pipe(dest(BUILD_DIR + '/css'))
        .pipe(browserSync.stream());
}

function dropStyles() {
    return src(APP_DIR + '/scss/Drop/drop.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(concat('drop.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest(APP_DIR + '/css/Drop'))
        .pipe(dest(BUILD_DIR + '/css/Drop'))
        .pipe(browserSync.stream());
}

function headerUserMenuStyles() {
    return src(APP_DIR + '/scss/header-user-menu.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(concat('header-user-menu.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest(APP_DIR + '/css'))
        .pipe(dest(BUILD_DIR + '/css'))
        .pipe(browserSync.stream());
}

const compileAssets = parallel(
    styles,
    orderNewStyles,
    headerUserMenuStyles,
    dropStyles,
    scripts,
    orderNewScripts,
    headerUserMenuScripts,
    dropScripts
);

function copyBuildAssets() {
    return src([
        APP_DIR + '/images/**/*',
        APP_DIR + '/fonts/**/*'
    ], { base: APP_DIR, allowEmpty: true })
        .pipe(dest(BUILD_DIR));
}

function assembleHtml(done) {
    assembleHtmlFiles({
        sourceDir: path.resolve(APP_DIR),
        outputDir: path.resolve(BUILD_DIR)
    });
    done();
}

function distBuild() {
    return src([
        APP_DIR + '/css/style.min.css',
        APP_DIR + '/css/order_new.min.css',
        APP_DIR + '/css/header-user-menu.min.css',
        APP_DIR + '/css/Drop/drop.min.css',
        APP_DIR + '/fonts/**/*',
        APP_DIR + '/js/main.min.js',
        APP_DIR + '/js/order_new.min.js',
        APP_DIR + '/js/header-user-menu.min.js',
        APP_DIR + '/js/Drop/drop.min.js',
        APP_DIR + '/*.html'
    ], { base: APP_DIR })
        .pipe(dest('dist'));
}

function reloadBrowser(done) {
    browserSync.reload();
    done();
}

function watching() {
    watch([APP_DIR + '/scss/style.scss', APP_DIR + '/scss/_*.scss'], styles);
    watch([APP_DIR + '/scss/order_new.scss'], orderNewStyles);
    watch([APP_DIR + '/scss/header-user-menu.scss'], headerUserMenuStyles);
    watch([APP_DIR + '/scss/Drop/**/*.scss'], dropStyles);
    watch([APP_DIR + '/js/main.js'], scripts);
    watch([APP_DIR + '/js/order_new.js'], orderNewScripts);
    watch([APP_DIR + '/js/header-user-menu.js'], headerUserMenuScripts);
    watch([APP_DIR + '/js/Drop/drop.js', APP_DIR + '/js/Drop/catalog.js'], dropScripts);
    watch([APP_DIR + '/images/**/*'], copyBuildAssets);
    watch([
        APP_DIR + '/*.html',
        APP_DIR + '/partials/**/*.html'
    ], series(assembleHtml, reloadBrowser));
}

exports.browsersync = browsersync;
exports.cleanDist = cleanDist;
exports.cleanBuild = cleanBuild;
exports.images = images;
exports.styles = styles;
exports.orderNewStyles = orderNewStyles;
exports.headerUserMenuStyles = headerUserMenuStyles;
exports.dropStyles = dropStyles;
exports.scripts = scripts;
exports.orderNewScripts = orderNewScripts;
exports.headerUserMenuScripts = headerUserMenuScripts;
exports.dropScripts = dropScripts;
exports.assembleHtml = assembleHtml;
exports.copyBuildAssets = copyBuildAssets;
exports.compileAssets = compileAssets;
exports.watching = watching;

exports.build = series(
    cleanBuild,
    compileAssets,
    copyBuildAssets,
    assembleHtml
);

exports.dist = series(cleanDist, images, compileAssets, distBuild);

exports.default = series(
    cleanBuild,
    compileAssets,
    copyBuildAssets,
    assembleHtml,
    parallel(browsersync, watching)
);
