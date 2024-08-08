import wasmPack from "vite-plugin-wasm-pack";

const packages = [
  "@icmc-ide/mif",
  "@icmc-ide/assembler",
  "@icmc-ide/icmc-cc",
  "@icmc-ide/icmc-emulator",
];

for (const _package of packages) {
}

let konsole = console;

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
  plugins: [],
};
