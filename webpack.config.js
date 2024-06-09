module.exports = {
  entry: {
    main: "./src/scripts/main.js",
    worker: "./src/scripts/worker.js",
    elements: "./src/scripts/elements/mod.js",
  },
  output: {
    path: __dirname + "./dist/scripts/",
  },
  target: "web",
  mode: "production",
  externals: {
    vs: "./src/scripts/modules/monaco-editor/min/vs",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
