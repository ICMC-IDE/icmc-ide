import * as monaco from "monaco-editor";
import MonacoWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import globalState, { GlobalState } from "./state/global.js";
import CharMap from "./resources/charmap.js";
import { contextMenusSetup } from "./context.js";
import { VirtualFileSystemFile } from "./resources/fs.js";
import { WindowsManager } from "./windows/mod.js";

self.MonacoEnvironment = {
  getWorker(label) {
    return new MonacoWorker({ name: label });
  },
};

async function main() {
  await createCharmap();
  contextMenusSetup();
  createDock(globalState);

  const { eventManager, resourceManager, configManager } = globalState;

  const windowManager = resourceManager.get("windowsManager");
  windowManager.openSaved();

  eventManager.subscribe("fileOpen", (file) => openFile(windowManager, file));
  eventManager.subscribe("build", buildFile);
  configManager.subscribe("frequency", (frequency) => {
    resourceManager.get("mainWorker").request("setFrequency", frequency);
  });

  function draw() {
    globalState.eventManager.emmit("render", undefined);
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

const modelCache: Map<VirtualFileSystemFile, monaco.editor.ITextModel> =
  new Map();

function createDock(globalState: GlobalState) {
  const dock = document.createElement("apps-dock");
  const windowsManager = globalState.resourceManager.get("windowsManager");

  dock.addEventListener("windowOpen", ({ detail: name }) => {
    windowsManager.open(name);
  });

  document.body.prepend(dock);
}

function buildFile(file: VirtualFileSystemFile) {
  const { resourceManager, eventManager, configManager } = globalState;
  const syntax = configManager.get("syntax");

  resourceManager
    .get("mainWorker")
    .request("build", {
      file: file.path,
      syntax,
    })
    .then(
      ({
        ram,
        vram,
        symbols,
        registers,
        internalRegisters,
        // asm,
        // mif,
      }) => {
        // const fs = resourceManager.get("fs").internal;

        resourceManager.set("ram", ram);
        resourceManager.set("vram", vram);
        resourceManager.set("registers", registers);
        resourceManager.set("internalRegisters", internalRegisters);
        resourceManager.set("symbols", symbols);
        resourceManager.set("cachedLog", undefined);

        eventManager.emmit("updateFs", undefined);
      },
    )
    .catch((error) => {
      resourceManager.set("cachedLog", error);
      eventManager.emmit("error", error);
    })
    .finally(() => {});
}

async function openFile(
  windowManager: WindowsManager,
  file: VirtualFileSystemFile,
) {
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

  const editor = windowManager.open("sourceEditor");
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
    new Uint8Array(await file.getArrayBuffer()),
    JSON.parse(await (await fs.getFile("internal/palette/8bit.json")).read()),
    file,
  );

  globalState.resourceManager.set("charmap", charmap);
}

await main();
document.getElementById("loading")!.remove();
