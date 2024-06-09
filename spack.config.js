const { config } = require("@swc/core/spack");

module.exports = config({
  entry: {
    main: "./src/scripts/main.js",
    worker: "./src/scripts/worker.js",
    elements: "./src/scripts/elements/mod.js",
  },
  output: {
    path: "./dist/scripts/",
  },
  target: "browser",
  mode: "production",
  options: {
    jsc: {
      target: "es2022",
      baseUrl: "/",
    },
    sourceMaps: true,
    // isModule: true,
    minify: true,
    // module: {
      // importInterop: "none",
      // preserveImportMeta: false,
    // }
  },
});
