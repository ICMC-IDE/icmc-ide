import * as monaco from "monaco-editor";
import MonacoWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import {
  createWindows,
  openWindow,
  SourceEditorWindow,
  Windows,
} from "./windows/mod.js";
import globalState, { GlobalState } from "./state/global.js";
import CharMap from "./resources/charmap.js";
import { contextSetup } from "./context.js";
import { VirtualFileSystemFile } from "./resources/fs.js";

self.MonacoEnvironment = {
  getWorker(label) {
    return new MonacoWorker({ name: label });
  },
};

async function main() {
  await createCharmap();
  contextSetup();
  const windows = createWindows(globalState);
  createDock(globalState, windows);

  globalState.eventManager.subscribe("fileOpen", openFile);
  globalState.configManager.subscribe("frequency", (frequency) => {
    globalState.resourceManager
      .get("mainWorker")
      .request("setFrequency", frequency);
  });

  function draw() {
    globalState.eventManager.emmit("render", undefined);
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

const modelCache: Map<VirtualFileSystemFile, monaco.editor.ITextModel> =
  new Map();

function createDock(globalState: GlobalState, windows: Partial<Windows>) {
  const dock = document.createElement("apps-dock");

  dock.addEventListener("windowOpen", ({ detail: type }) => {
    let win = windows[type];

    if (win === undefined || !win.isOpen) {
      win = windows[type] = openWindow(type, { globalState });
    }

    win.focus();
  });

  document.body.prepend(dock);
}

async function openFile(file: VirtualFileSystemFile) {
  if (!modelCache.has(file)) {
    modelCache.set(
      file,
      await (async () => {
        const extension = file.name.match(/\.([^.]+)$/);
        let language;

        if (extension) {
          language = extension[1].toLowerCase();
        }

        return monaco.editor.createModel(await file.read(), language);
      })(),
    );
  }

  const editor = new SourceEditorWindow({
    style: {
      left: "5em",
      top: "1em",
      width: "50ch",
      height: "50em",
    },
    globalState,
  });

  editor.setModel(modelCache.get(file)!, file);
  editor.focus();
}

async function createCharmap() {
  const fs = globalState.resourceManager.get("fs");

  // const result = await globalState.resourceManager
  //   .get("mainWorker")
  //   .request(
  //     "parseMif",
  //     await (await fs.getFile("internal/charmap.mif")).read(),
  //   );

  const file = await fs.getFile("internal/charmap.bin");

  const charmap = CharMap.fromBytes(
    new Uint8Array(await file.arrayBuffer()),
    JSON.parse(await (await fs.getFile("internal/palette/8bit.json")).read()),
    file,
  );

  globalState.resourceManager.set("charmap", charmap);
}

await main();
document.getElementById("loading")!.remove();
