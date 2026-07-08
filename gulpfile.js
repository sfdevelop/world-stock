const {src, dest, watch, parallel, series} = require('gulp');
const sass         = require('gulp-sass')(require('sass'));
const concat       = require ('gulp-concat');
const browserSync  = require('browser-sync').create();
const uglify       = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const del          = require('del');

function browsersync(){
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
}

function cleanDist(){
    return del('dist');
}

// Копіювання зображень без оптимізації
function images(){
    return src('app/images/**/*')
        .pipe(dest('dist/images'));
}

function scripts(){
    return src([
        // 'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function orderNewScripts(){
    return src('app/js/order_new.js')
    .pipe(uglify())
    .pipe(concat('order_new.min.js'))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function headerUserMenuScripts(){
    return src('app/js/header-user-menu.js')
    .pipe(uglify())
    .pipe(concat('header-user-menu.min.js'))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function styles(){
    return src('app/scss/style.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function orderNewStyles(){
    return src('app/scss/order_new.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('order_new.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function headerUserMenuStyles(){
    return src('app/scss/header-user-menu.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat('header-user-menu.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function build (){
    return src([
        'app/css/style.min.css',
        'app/css/order_new.min.css',
        'app/css/header-user-menu.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/js/order_new.min.js',
        'app/js/header-user-menu.min.js',
        'app/*.html'
    ], {base:'app'})
    .pipe(dest('dist'));
}

function watching(){
    watch(['app/scss/style.scss', 'app/scss/_*.scss'], styles);
    watch(['app/scss/order_new.scss'], orderNewStyles);
    watch(['app/scss/header-user-menu.scss'], headerUserMenuStyles);
    watch(['app/js/main.js'], scripts);
    watch(['app/js/order_new.js'], orderNewScripts);
    watch(['app/js/header-user-menu.js'], headerUserMenuScripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}

exports.browsersync = browsersync;
exports.cleanDist = cleanDist;
exports.images = images;
exports.styles = styles;
exports.orderNewStyles = orderNewStyles;
exports.headerUserMenuStyles = headerUserMenuStyles;
exports.scripts = scripts;
exports.orderNewScripts = orderNewScripts;
exports.headerUserMenuScripts = headerUserMenuScripts;
exports.watching = watching;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, orderNewStyles, headerUserMenuStyles, scripts, orderNewScripts, headerUserMenuScripts, browsersync, watching);
