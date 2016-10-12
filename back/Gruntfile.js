module.exports = function (grunt) {
  grunt.initConfig({
    ts: {
      default: {
        src: ["src/**/*.ts"],
        outDir: "compile",
        watch: 'src' //监控某个目录，同时执行grunt之后自动开启watch功能
      },
      options: {
        module: 'commonjs',
        sourceMap: true,
        comments: false,//编译后是否保留注释
        target: 'es6',
        compiler: 'node_modules/typescript/bin/tsc'
      }
    }
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.registerTask("default", ["ts"]);
};