import * as monaco from "monaco-editor";
import MonacoWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import {
  createWindows,
  openWindow,
  SourceEditorWindow,
} from "./windows/mod.js";
import globalState, { GlobalState } from "./state/global.js";
import CharMap from "./resources/charmap.js";

self.MonacoEnvironment = {
  getWorker(workerId, label) {
    return new MonacoWorker({ name: label });
  },
};

async function main() {
  await createCharmap();
  createDock(globalState);
  createWindows(globalState);

  globalState.eventManager.subscribe("open-file", openFile);

  function draw() {
    globalState.eventManager.emmit("render", undefined);
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

const modelCache: Record<string, monaco.editor.ITextModel> = {};

function createDock(globalState: GlobalState) {
  const dock = document.createElement("apps-dock");

  dock.addEventListener("open-window", ({ detail: type }) => {
    const window = openWindow(type, { globalState });
    window.toggleMinimize(false);
  });

  document.body.prepend(dock);
}

function openFile(filename: string) {
  modelCache[filename] ??= (() => {
    const extension = filename.match(/\.([^.]+)$/);
    let language;

    if (extension) {
      language = extension[1].toLowerCase();
      console.log(language);
    }

    return monaco.editor.createModel(
      globalState.resources.get("fs").read(filename)!,
      language,
    );
  })();

  const editor = new SourceEditorWindow({
    style: {
      left: "0.5rem",
      top: "0.5rem",
      width: "50ch",
      height: "50rem",
    },
    globalState,
  });

  editor.setModel(modelCache[filename], filename);
}

async function createCharmap() {
  const fs = globalState.resources.get("fs");

  const result = await globalState.resources
    .get("main-worker")
    .request("parse-mif", fs.read("charmap.mif")!);

  const charmap = CharMap.fromBytes(
    result,
    fs.readJSON<string[]>("palette/8bit.json")!,
  );

  globalState.resources.set("charmap", charmap);
}

main().catch((error) => console.error(error));
