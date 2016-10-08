var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var pump = require('pump');

gulp.task('copy', function(cb) {
   pump([
         gulp.src('src/*.js'),
         gulp.dest('dist')
      ],
      cb
   );
});

gulp.task('compress', function(cb) {
   pump([
         gulp.src('src/*.js'),
         uglify(),
         rename({
            suffix: '.min'
         }),
         gulp.dest('dist')
      ],
      cb
   );
});

gulp.task('default', ['compress', 'copy']);