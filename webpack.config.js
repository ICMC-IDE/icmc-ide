module.exports ={
  entry: {
    main: "./src/scripts/main.js",
    worker: "./src/scripts/worker.js",
  },
  output: {
    path: __dirname + "/dist/scripts/",
  },
  mode: "production",
};
