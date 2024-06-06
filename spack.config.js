const { config } = require("@swc/core/spack");

module.exports = config({
  entry: {
    main: "./src/scripts/main.js",
    worker: "./src/scripts/worker.js",
  },
  output: {
    path: "./dist/scripts/",
  },
  mode: "production",
  options: {
    jsc: {
      target: "es2022",
      minify: {
        compress: true,
      },
      baseUrl: "/",
    }
  }
});
