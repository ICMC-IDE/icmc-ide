import "./elements.js";
import initBackend, * as backend from "./modules/backend/backend.js";
import { setCallback } from "./modules/ide.js";
import Fenster from "./modules/fenster.js";

const ctx = canvas.getContext("2d");

let key = 255;
let ticks_missing = 0;
let last_tick;
let last_check;
let ticks = 0;
let play_interval;
let interupt = false;

const modules = await Promise.all([initBackend()]);

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

function parseCharmap(data) {
  const imageData = ctx.createImageData(8, 1024);
  data
    .split("\n")
    .filter((line) => /^\s*[\d\[].*:/.test(line))
    .forEach((line) => {
      line = line.trim();

      const res = line.match(/^(\d+)\s*:\s*([0-1]+)/);

      if (res) {
        let [_, offset, value] = res;

        offset = parseInt(offset, 10);
        value = parseInt(value, 2);

        for (let j = 0, k = 32 * offset; j < 8; j++) {
          imageData.data[k++] = 0xFF * ((value >> (7 - j)) & 0b1);
          imageData.data[k++] = 0xFF * ((value >> (7 - j)) & 0b1);
          imageData.data[k++] = 0xFF * ((value >> (7 - j)) & 0b1);
          imageData.data[k++] = 0xFF;
        }
      } else {
        let [_, from, to, value] = line.match(/^\[(\d+)\.\.(\d+)\]\s*:\s*([01]+)/);

        from = parseInt(from, 10);
        to = parseInt(to, 10);
        value = parseInt(value, 2);

        for (let offset = from; offset <= to; offset++) {
          for (let j = 0, k = 32 * offset; j < 8; j++) {
            imageData.data[k++] = 0xFF * ((value >> (7 - j)) & 0b1);
            imageData.data[k++] = 0xFF * ((value >> (7 - j)) & 0b1);
            imageData.data[k++] = 0xFF * ((value >> (7 - j)) & 0b1);
            imageData.data[k++] = 0xFF;
          }
        }

      }
    });
  return imageData;
}

// FIXME
function parseMif(memory, data) {
  data
    .split("\n")
    .filter((line) => /^\s*[\d\[].*:/.test(line))
    .flatMap((line) => {
      line = line.trim();

      const res = line.match(/^(\d+)\s*:\s*([0-1]+)/);

      if (res) {
        return [res];
      } else {
        let [_, from, to, value] = line.match(/^\[(\d+)\.\.(\d+)\]\s*:\s*([01]+)/);

        from = parseInt(from, 10);
        to = parseInt(to, 10);
        value = parseInt(value, 2);

        let values = [];

        for (let i = from; i <= to; i++) {
          values.push([null, i, value]);
        }

        return values;
      }
    })
    .forEach(([_, offset, value]) => {
      memory[parseInt(offset, 10)] = parseInt(value, 2);
    });
}

class Emulator {
  #vm = new backend.Vm();
  #memory = new Uint16Array(modules[0].memory.buffer, this.#vm.memory(), 1 << 16);
  #registers = new Uint16Array(modules[0].memory.buffer, this.#vm.registers(), 11);
  #charmap;
  #regions;
  #isHalted = false;
  #bin;
  #symbols;
  #result;
  #assembler = new backend.Assembler();

  constructor() { }

  compile(code) {
    // C compiler goes in here
  }

  assemble(code) {
    try {
      this.#assembler.add_file("program.asm", code);
      const result = this.#assembler.assemble("icmc.asm:program.asm");;

      this.#result = result;
      this.#bin = result.binary();
      this.#symbols = result.symbols();

      logViewer.clear();

      this.reset();
      this.update();

      return true;
    } catch (error) {
      console.error(error);
      logViewer.write(error);

      return false;
    }
  }

  loadCharmapMif(mif) {
    this.#charmap = parseCharmap(mif);
  }

  loadMif(program) {
    parseMif(this.#memory, program);
  }

  reset() {
    this.#isHalted = false;
    this.load(this.#bin, this.#symbols);
  }

  load(bin, symbols) {
    const labels = symbols
      .split("\n")
      .filter((line) => line.includes("="))
      .map((line) => {
        const [name, address] = line.split(" = ");
        return [name, parseInt(address)];
      });


    if (labels.length == 0 || labels[0][1] > 0) {
      labels.splice(0, 0, ["...", 0]);
    }

    this.#regions = labels;
    this.#vm.load(bin);

    memoryEditor.load(this.memory, labels);

    this.update();

    ctx.fill = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  tick(n) {
    let clocks = 0;

    while (clocks < n) {
      if (this.#isHalted) {
        return false;
      } else if (interupt) {
        interupt = false;
        break;
      }

      clocks += this.#vm.tick();
    }

    return clocks;
  }

  update() {
    this.updateRegisters();
    this.updateCursor();
  }

  exportMif() {
    return this.#result.mif();
  }

  callback(name, ...args) {
    switch (name) {
      case "write":
        this.write(...args);
        break;
      case "halt":
        this.#isHalted = true;
        break;
      case "store":
        memoryEditor.update(...args);
        break;
      case "read":
        return key;
      case "breakpoint":
        clearInterval(play_interval);
        play_interval = undefined;
        interupt = true;
        break;
      default:
        console.log("cb", ...arguments);
    }
  }

  write(char, offset) {
    ctx.putImageData(this.#charmap, (offset % 40) * 8, Math.floor(offset / 40 - char) * 8, 0, char * 8, 8, 8);
  }

  updateCursor() {
    memoryEditor.pc = this.pc;
    memoryEditor.sp = this.sp;
  }

  updateRegisters() {
    stateEditor.registers = this.registers;
  }

  addStdFile(filename, contents) {
    this.#assembler.add_std_file(filename, contents);
  }

  get pc() {
    return this.registers[10];
  }

  get sp() {
    return this.registers[9];
  }

  get memory() {
    if (this.#memory.length === 0) {
      this.#memory = new Uint16Array(modules[0].memory.buffer, this.#vm.memory(), 1 << 16);
    }

    return this.#memory;
  }

  get registers() {
    if (this.#registers.length === 0) {
      this.#registers = new Uint16Array(modules[0].memory.buffer, this.#vm.registers(), 12);
    }

    return this.#registers;
  }

  get regions() {
    return this.#regions;
  }
}

const assets = await Promise.all((await Promise.all(["icmc.asm", "giroto.asm", "charmap.mif", "example.asm"].map((filename) => fetch(`assets/${filename}`)))).map((data) => data.text()));
const emulator = new Emulator();

emulator.addStdFile("icmc.asm", assets[0]);
emulator.addStdFile("giroto.asm", assets[1]);

textEditor.value = localStorage.getItem("script") ?? assets[3];
console.log(textEditor);

window.play = function() {
  if (play_interval) return;

  last_tick = performance.now();

  play_interval = setInterval(function() {
    ticks_missing += (performance.now() - last_tick) * stateEditor.frequency * 1e-3;
    last_tick = performance.now();

    const result = emulator.tick(ticks_missing);

    // this can be 0, so it must be compared to false
    if (result === false) {
      clearInterval(play_interval);
      play_interval = undefined;
      return;
    }

    ticks_missing -= result;
    ticks += result;
  }, 0);
}

window.assemble = function() {
  emulator.assemble(textEditor.value);
};

window.reset = function() {
  return emulator.reset();
}

window.next = function() {
  return emulator.tick(1);
}

window.exportMif = function() {
  const ok = emulator.assemble(textEditor.value);

  if (!ok) return;

  const blob = new Blob([emulator.exportMif()], { type: "text/x-mif" });
  download(blob, "program.mif");
}

window.downloadAsm = function() {
  const blob = new Blob([textEditor.value], { type: "text/x-asm" });
  download(blob, "program.asm");
}

window.stop = function() {
  if (!play_interval) return;

  clearInterval(play_interval);
  play_interval = undefined;
}

window.addEventListener("keydown", function(event) {
  key = event.keyCode;
});

window.addEventListener("keyup", function() {
  key = 255;
});

function draw() {
  emulator.update();
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
emulator.loadCharmapMif(assets[2]);

setCallback(function() {
  return emulator.callback(...arguments);
});

setInterval(function() {
  const now = performance.now();

  if (last_check) {
    console.log(1e3 * ticks / (now - last_check), "Hz");
  }

  ticks = 0;
  last_check = now;

  localStorage.setItem("script", textEditor.value);
}, 1000);

{
  const text = new Fenster({
    title: "Code",
    body: textEditor,
    style: {
      left: "0.5rem",
      top: "0.5rem",
      width: "50ch",
      height: "50rem",
    },
  });

  const textBounds = text.getClientRect();

  const state = new Fenster({
    title: "State",
    body: stateEditor,
    style: {
      left: `calc(${textBounds.right}px + 0.5rem)`,
      top: "0.5rem",
    },
  });

  const stateBounds = state.getClientRect();

  const memory = new Fenster({
    title: "Memory",
    body: memoryEditor,
    style: {
      left: `calc(${textBounds.right}px + 0.5rem)`,
      top: `calc(${stateBounds.bottom}px + 0.5rem)`,
      height: "20rem",
    },
  });

  const memoryBounds = memory.getClientRect();

  const screenViewer = new Fenster({
    title: "Screen",
    body: canvas,
    style: {
      left: `calc(${stateBounds.right}px + 0.5rem)`,
      top: "0.5rem",
      width: "640px",
      height: "480px",
    },
  });

  const log = new Fenster({
    title: "Log",
    body: logViewer,
    style: {
      left: `calc(${textBounds.right}px + 0.5rem)`,
      top: `calc(${memoryBounds.bottom}px + 0.5rem)`,
    },
  });
}
