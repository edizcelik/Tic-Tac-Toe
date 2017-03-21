'use strict';


var gulp = require('gulp');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();


gulp.task('default', ['watch']);

gulp.task('jshint', function() {
	return gulp.src('./scripts/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('sass', function() {
	return gulp.src('./styles/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest('./styles'))
		.pipe(browserSync.stream());
});

gulp.task('watch', function() {
	browserSync.init({
		server: "."
	});

	gulp.watch('./scripts/**/*.js', ['jshint']).on('change', browserSync.reload);
	gulp.watch('./styles/**/*.scss', ['sass']);
	gulp.watch('*.html').on('change', browserSync.reload);
});