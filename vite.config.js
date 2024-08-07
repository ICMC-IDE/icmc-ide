import wasmPack from "vite-plugin-wasm-pack";

const packages = [
  "@icmc-ide/mif",
  "@icmc-ide/assembler",
  "@icmc-ide/icmc-cc",
  "@icmc-ide/icmc-emulator",
];

for (const _package of packages) {
}

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
    extensions: [".wasm"],
    esbuildOptions: {
      plugins: [
        {
          name: "foo",
          setup(...args) {
            console.log(args);
          },
        },
      ],
    },
  },
  plugins: [],
};
