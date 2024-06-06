import * as config from "./config.js";
import "./elements/mod.js";
import { createWindows } from "./windows/mod.js";
import CharMap from "./charmap.js";

async function main() {
  const worker = new Worker("./scripts/worker.js", { type: "module" });
  const assets = await Promise.all((await Promise.all(["charmap.mif", "example.asm"].map((filename) => fetch(`../assets/${filename}`)))).map((data) => data.text()));
  const windows = createWindows();

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

  windows.screen.body.width = (windows.charmap.body.width = config.screenWidth.get());
  windows.screen.body.height = (windows.charmap.body.height = config.screenHeight.get());

  windows.text.body.value = config.sourceCode.get()[config.language.get()];

  config.frequency.subscribe((value) => {
    worker.postMessage(["frequency", value]);
  });

  window.play = function(mode) {
    return worker.postMessage("play");
  }

  window.stop = function() {
    return worker.postMessage("stop");
  }

  window.build = function() {
    config.sourceCode.update((value) => {
      value[config.language.get()] = windows.text.body.value;
      return value;
    });

    return worker.postMessage(["build", {
      language: config.language.get(),
      syntax: config.syntax.get(),
      source: windows.text.body.value,
    }]);
  };

  window.reset = function() {
    return worker.postMessage("reset");
  }

  window.next = function() {
    return worker.postMessage("next");
  }

  window.exportMif = function() {
    /*
    const ok = emulator.assemble(textEditor.value);

    if (!ok) return;

    const blob = new Blob([emulator.exportMif()], { type: "text/x-mif" });
    download(blob, "program.mif");
    */
  }

  window.downloadAsm = function() {
    /*
    const blob = new Blob([textEditor.value], { type: "text/x-asm" });
    download(blob, "program.asm");
    */
  }

  window.addEventListener("keydown", function(event) {
    return worker.postMessage(["key", event.keyCode]);
  });

  window.addEventListener("keyup", function() {
    return worker.postMessage(["key", 255]);
  });

  function draw() {
    windows.screen.body.render();
    windows.charmap.body.render();
    windows.state.body.render();

    requestAnimationFrame(draw);
  }

  {
    const charmap = CharMap.fromMif(assets[0]);

    windows.screen.body.charmap = charmap;
    windows.charmap.body.charmap = charmap;
  }

  requestAnimationFrame(draw);

  worker.addEventListener("message", function({ data }) {
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
        case "write":
          return windows.screen.body.updateCell(data[2], data[1]);
        case "registers":
          windows.state.body.registers = data[1];
          break;
        case "memory":
          windows.log.body.clear();
          return windows.memory.body.load(data[1], data[2]);
        case "log":
          windows.log.body.write(data[1]);
          break;
        case "store":
          windows.memory.body.update(data[1], data[2]);
          break;
        default:
          console.log(data);
      }
    }
  });

  worker.addEventListener("messageerror", function(event) {
    console.error(event);
  });

  worker.addEventListener("error", function(event) {
    console.error(event);
  });
}

main()
  .catch((error) => console.error(error));
