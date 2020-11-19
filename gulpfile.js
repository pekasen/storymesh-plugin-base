'use strict';
var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var merge = require('merge-stream');
sass.compiler = require('node-sass');

gulp.task('sass-story', function () {
  const uiThemes = gulp.src('./src/**/ui-themes.scss')
  const storyThemes = gulp.src('./src/**/story-themes.scss')
  const preview = gulp.src( './src/**/Preview.scss')

  return merge(uiThemes, storyThemes, preview)
    .pipe(concat('./ngwebs-story.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css/'));
});
 
gulp.task('sass', function () {
  return gulp.src(['./src/**/*.scss', '!./src/**/Preview.scss'])
    .pipe(concat('./ngwebs.scss'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css/'));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./src/**/*.scss', gulp.series('sass'));
});