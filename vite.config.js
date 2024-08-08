/** @type {import("vite").UserConfig} */
export default {
  build: {
    minify: true,
    target: "es2022",
  },
  server: {
    port: 3000,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    noDiscovery: true,
  },
};
