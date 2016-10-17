var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", () => {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest("dist"));
});

gulp.task('watch', () => {
  gulp.watch(['src/**/*.ts', 'test/**/*.ts']).on('change', (e) => {
  }));
});