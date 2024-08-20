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
import { FsFile } from "./resources/fs.js";

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

  function draw() {
    globalState.eventManager.emmit("render", undefined);
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

const modelCache: Record<string, monaco.editor.ITextModel> = {};

function createDock(globalState: GlobalState, windows: Partial<Windows>) {
  const dock = document.createElement("apps-dock");

  dock.addEventListener("windowOpen", ({ detail: type }) => {
    let win = windows[type];

    if (win === undefined || !win.isOpen) {
      win = windows[type] = openWindow(type, { globalState });
    }

    win.toggleMinimize(false);
    win.focus();
  });

  document.body.prepend(dock);
}

function openFile(file: FsFile) {
  modelCache[file.id] ??= (() => {
    const extension = file.name.match(/\.([^.]+)$/);
    let language;

    if (extension) {
      language = extension[1].toLowerCase();
      console.log(language);
    }

    return monaco.editor.createModel(file.content, language);
  })();

  const editor = new SourceEditorWindow({
    style: {
      left: "5em",
      top: "1em",
      width: "50ch",
      height: "50em",
    },
    globalState,
  });

  editor.setModel(modelCache[file.id], file.name);
  editor.focus();
}

async function createCharmap() {
  const fs = globalState.resourceManager.get("fs").internal;

  console.log(fs.root.open("charmap.mif"));

  const result = await globalState.resourceManager
    .get("mainWorker")
    .request("parse-mif", (fs.root.open("charmap.mif")! as FsFile).content);

  const charmap = CharMap.fromBytes(
    result,
    JSON.parse((fs.root.open("palette/8bit.json", false)! as FsFile).content),
  );

  globalState.resourceManager.set("charmap", charmap);
}

await main();
document.getElementById("loading")!.remove();
