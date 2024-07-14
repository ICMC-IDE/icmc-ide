import {
  createWindows,
  ScreenViewerWindow,
  SourceEditorWindow,
} from "./windows/mod.js";
import CharMap from "./charmap.js";
import fs from "./fs.js";
import EventManager from "state/event";
import ConfigManager from "state/config";
import GlobalState from "state";

declare global {
  interface ConfigMap {
    syntax: string;
    screenWidth: number;
    screenHeight: number;
    frequency: number;
    entryFile: string;
    files: Record<string, string>;
  }
  interface EventMap {
    deleteFile: FileManagerFile;
    openFile: FileManagerFile;
    refresh: {
      registers: Uint16Array;
      internalRegisters: Uint16Array;
      ram: Uint16Array;
      vram: Uint16Array;
      symbols: string;
    };
    setCharmap: CharMap;
    render: void;
  }
}

const { default: initMif, parseMif } = await import("../modules/mif/mif.js");
const colorPalette = [
  "#FFFFFF",
  "#FFFFAA",
  "#FFFF55",
  "#FFFF00",
  "#FFDAFF",
  "#FFDAAA",
  "#FFDA55",
  "#FFDA00",
  "#FFB6FF",
  "#FFB6AA",
  "#FFB655",
  "#FFB600",
  "#FF91FF",
  "#FF91AA",
  "#FF9155",
  "#FF9100",
  "#FF6DFF",
  "#FF6DAA",
  "#FF6D55",
  "#FF6D00",
  "#FF48FF",
  "#FF48AA",
  "#FF4855",
  "#FF4800",
  "#FF24FF",
  "#FF24AA",
  "#FF2455",
  "#FF2400",
  "#FF00FF",
  "#FF00AA",
  "#FF0055",
  "#FF0000",
  "#DAFFFF",
  "#DAFFAA",
  "#DAFF55",
  "#DAFF00",
  "#DADAFF",
  "#DADAAA",
  "#DADA55",
  "#DADA00",
  "#DAB6FF",
  "#DAB6AA",
  "#DAB655",
  "#DAB600",
  "#DA91FF",
  "#DA91AA",
  "#DA9155",
  "#DA9100",
  "#DA6DFF",
  "#DA6DAA",
  "#DA6D55",
  "#DA6D00",
  "#DA48FF",
  "#DA48AA",
  "#DA4855",
  "#DA4800",
  "#DA24FF",
  "#DA24AA",
  "#DA2455",
  "#DA2400",
  "#DA00FF",
  "#DA00AA",
  "#DA0055",
  "#DA0000",
  "#B6FFFF",
  "#B6FFAA",
  "#B6FF55",
  "#B6FF00",
  "#B6DAFF",
  "#B6DAAA",
  "#B6DA55",
  "#B6DA00",
  "#B6B6FF",
  "#B6B6AA",
  "#B6B655",
  "#B6B600",
  "#B691FF",
  "#B691AA",
  "#B69155",
  "#B69100",
  "#B66DFF",
  "#B66DAA",
  "#B66D55",
  "#B66D00",
  "#B648FF",
  "#B648AA",
  "#B64855",
  "#B64800",
  "#B624FF",
  "#B624AA",
  "#B62455",
  "#B62400",
  "#B600FF",
  "#B600AA",
  "#B60055",
  "#B60000",
  "#91FFFF",
  "#91FFAA",
  "#91FF55",
  "#91FF00",
  "#91DAFF",
  "#91DAAA",
  "#91DA55",
  "#91DA00",
  "#91B6FF",
  "#91B6AA",
  "#91B655",
  "#91B600",
  "#9191FF",
  "#9191AA",
  "#919155",
  "#919100",
  "#916DFF",
  "#916DAA",
  "#916D55",
  "#916D00",
  "#9148FF",
  "#9148AA",
  "#914855",
  "#914800",
  "#9124FF",
  "#9124AA",
  "#912455",
  "#912400",
  "#9100FF",
  "#9100AA",
  "#910055",
  "#910000",
  "#6DFFFF",
  "#6DFFAA",
  "#6DFF55",
  "#6DFF00",
  "#6DDAFF",
  "#6DDAAA",
  "#6DDA55",
  "#6DDA00",
  "#6DB6FF",
  "#6DB6AA",
  "#6DB655",
  "#6DB600",
  "#6D91FF",
  "#6D91AA",
  "#6D9155",
  "#6D9100",
  "#6D6DFF",
  "#6D6DAA",
  "#6D6D55",
  "#6D6D00",
  "#6D48FF",
  "#6D48AA",
  "#6D4855",
  "#6D4800",
  "#6D24FF",
  "#6D24AA",
  "#6D2455",
  "#6D2400",
  "#6D00FF",
  "#6D00AA",
  "#6D0055",
  "#6D0000",
  "#48FFFF",
  "#48FFAA",
  "#48FF55",
  "#48FF00",
  "#48DAFF",
  "#48DAAA",
  "#48DA55",
  "#48DA00",
  "#48B6FF",
  "#48B6AA",
  "#48B655",
  "#48B600",
  "#4891FF",
  "#4891AA",
  "#489155",
  "#489100",
  "#486DFF",
  "#486DAA",
  "#486D55",
  "#486D00",
  "#4848FF",
  "#4848AA",
  "#484855",
  "#484800",
  "#4824FF",
  "#4824AA",
  "#482455",
  "#482400",
  "#4800FF",
  "#4800AA",
  "#480055",
  "#480000",
  "#24FFFF",
  "#24FFAA",
  "#24FF55",
  "#24FF00",
  "#24DAFF",
  "#24DAAA",
  "#24DA55",
  "#24DA00",
  "#24B6FF",
  "#24B6AA",
  "#24B655",
  "#24B600",
  "#2491FF",
  "#2491AA",
  "#249155",
  "#249100",
  "#246DFF",
  "#246DAA",
  "#246D55",
  "#246D00",
  "#2448FF",
  "#2448AA",
  "#244855",
  "#244800",
  "#2424FF",
  "#2424AA",
  "#242455",
  "#242400",
  "#2400FF",
  "#2400AA",
  "#240055",
  "#240000",
  "#00FFFF",
  "#00FFAA",
  "#00FF55",
  "#00FF00",
  "#00DAFF",
  "#00DAAA",
  "#00DA55",
  "#00DA00",
  "#00B6FF",
  "#00B6AA",
  "#00B655",
  "#00B600",
  "#0091FF",
  "#0091AA",
  "#009155",
  "#009100",
  "#006DFF",
  "#006DAA",
  "#006D55",
  "#006D00",
  "#0048FF",
  "#0048AA",
  "#004855",
  "#004800",
  "#0024FF",
  "#0024AA",
  "#002455",
  "#002400",
  "#0000FF",
  "#0000AA",
  "#000055",
  "#000000",
];

async function main() {
  const eventManager = new EventManager();
  const configManager = new ConfigManager();
  const globalState: GlobalState = {
    eventManager,
    configManager,
  };

  const worker = new Worker("./scripts/worker.js", { type: "module" });
  const assets = await Promise.all(
    (
      await Promise.all(
        ["charmap.mif", "example.asm"].map((filename) =>
          fetch(`../assets/${filename}`),
        ),
      )
    ).map((data) => data.text()),
  );
  const windows = createWindows(globalState);

  const contextMenu = document.createElement("div");
  contextMenu.style.position = "absolute";
  contextMenu.style.display = "none";
  {
    const openable_windows = {
      Screen: ScreenViewerWindow,
      DASDASDSA: ScreenViewerWindow,
    };
    for (const [window_name, window_class] of Object.entries(
      openable_windows,
    )) {
      const item = document.createElement("button");

      item.textContent = window_name;
      item.addEventListener("click", (event) => {
        window.hideContext();
        new window_class({
          style: {
            left: event.clientX + "px",
            top: event.clientY + "px",
            // width: "50ch",
            // height: "50rem",
          },
          globalState,
        });
      });
      contextMenu.appendChild(item);
    }
    document.body.appendChild(contextMenu);

    await initMif();

    /*
    function download(blob, name) {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
   
      link.href = blobUrl;
      link.download = name;
   
      document.body.appendChild(link);
   
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        })
      );
   
      document.body.removeChild(link);
    }
    */

    // config.sourceCode.update((value) => value ?? assets[1]);
    // textEditor.value = localStorage.getItem(`script.${configEditor.language}`) ?? assets[1];

    const openFiles: Record<string, monaco.editor.ITextModel> = {};

    eventManager.subscribe("openFile", (fileName) => {
      openFiles[fileName] ??= (() => {
        const extension = fileName.match(/\.(.*)$/);
        let language;

        if (extension) {
          language = extension[1].toLowerCase();
        }

        return monaco.editor.createModel(
          configManager.get("files")![fileName], // configManager.get("filesystem", fileName),
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

      editor.model = openFiles[fileName];
    });

    configManager.subscribe("frequency", (frequency) => {
      worker.postMessage(["frequency", frequency]);
    });

    window.play = function () {
      return worker.postMessage("play");
    };

    window.stop = function () {
      return worker.postMessage("stop");
    };

    window.build = function () {
      const entryFile = configManager.get("entryFile")!;
      let source;

      if (openFiles[entryFile]) {
        source = openFiles[entryFile].getValue();
      } else {
        source = configManager.get("files")![entryFile];
      }

      const extension = entryFile.match(/\.(.*)$/);
      let language;

      if (extension) {
        language = extension[1].toLowerCase();
      }

      return worker.postMessage([
        "build",
        {
          syntax: configManager.get("syntax"),
          language,
          source,
        },
      ]);
    };

    window.reset = function () {
      return worker.postMessage("reset");
    };

    window.next = function () {
      return worker.postMessage("next");
    };

    window.exportMif = function () {
      /*
      const ok = emulator.assemble(textEditor.value);
   
      if (!ok) return;
   
      const blob = new Blob([emulator.exportMif()], { type: "text/x-mif" });
      download(blob, "program.mif");
      */
    };

    window.downloadAsm = function () {
      /*
      const blob = new Blob([textEditor.value], { type: "text/x-asm" });
      download(blob, "program.asm");
      */
    };

    window.showContext = function (event) {
      event.preventDefault();

      contextMenu.style.left = event.clientX + "px";
      contextMenu.style.top = event.clientY + "px";
      contextMenu.style.display = "grid";
    };

    window.hideContext = function () {
      contextMenu.style.display = "none";
    };

    function draw() {
      eventManager.emmit("render", undefined);
      // windows.screen.render();
      // windows.charmap.body.render();
      // windows.state.body.render();

      requestAnimationFrame(draw);
    }

    {
      const result = parseMif(assets[0]);
      const charmap = CharMap.fromBytes(result, colorPalette);

      eventManager.emmit("setCharmap", charmap);
      // windows.charmap.colorPalette = colorPalette;
      // windows.screen.body.charmap = charmap;
      // windows.charmap.body.charmap = charmap;
    }

    requestAnimationFrame(draw);

    worker.addEventListener("message", function ({ data }) {
      if (typeof data === "string") {
        switch (data) {
          case "stop":
            windows.state.body.running = false;
            break;
          case "play":
            windows.state.body.running = true;
            break;
          default:
            console.log(data);
        }
      } else {
        switch (data[0]) {
          case "build":
            eventManager.emmit("refresh", data[1]);
            break;
          case "asmsource":
            // config.sourceCode.set({ ...config.sourceCode.get(), ['asm']: data[1] });
            break;
          case "store":
            windows.memory.body.update(data[1], data[2]);
            break;
          default:
            console.log(data);
        }
      }
    });

    worker.addEventListener("messageerror", function (event) {
      console.error(event);
    });

    worker.addEventListener("error", function (event) {
      console.error(event);
    });
  }
}

main().catch((error) => console.error(error));
