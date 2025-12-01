const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

// Rutas
const paths = {
    scss: 'src/scss/**/*.scss',
    css: 'dist/css'
};

// Tarea para compilar SCSS
function compileSCSS() {
    return gulp.src(paths.scss)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.css));
}

// Watch
function watchFiles() {
    gulp.watch(paths.scss, compileSCSS);
}

exports.default = gulp.series(compileSCSS, watchFiles);
