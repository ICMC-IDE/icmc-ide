import initBackend, * as backend from "./modules/backend/backend.js";
import { setCallback } from "./modules/ide.js";

const memEditor = document.getElementById("mem-editor");
const regEditor = document.getElementById("reg-editor");
const logEditor = document.getElementById("log-editor");
const frequency = document.getElementById("frequency");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let asmEditor;
let key = 255;

const modules = await Promise.all([initBackend()]);
const names = ["1 Hz", "10 Hz", "100 Hz", "1 kHz", "10 kHz", "100 kHz", "1 MHz", "10 MHz", "100 MHz", "FAST!"];

// in Hz
let clock = 10 ** frequency.valueAsNumber;

frequency.addEventListener("input", function() {
  if (this.valueAsNumber == 9) {
    clock = 0;
  } else {
    clock = 10 ** this.valueAsNumber;
  }
  this.nextSibling.innerText = names[this.valueAsNumber];
});

frequency.nextSibling.innerText = names[frequency.valueAsNumber];

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
  #cells;
  #bin;
  #symbols;
  #result;
  #old_pc = 0;
  #old_sp = (1 << 16) - 1;

  constructor() {}

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

  loadAsm(code) {
    try {
      const result = new backend.Code(code);

      this.#result = result;

      this.#bin = result.binary();
      this.#symbols = result.symbols();

      this.reset();
      logEditor.innerHTML = "";
      return true;
    } catch (err) {
      // Code copied from https://github.com/hlorenzi/customasm/blob/b6978f90891915f1e4844d498a179249819406bd/web/main.js

      let output = err;
    	output = output.replace(/\</g, "&lt;");
    	output = output.replace(/\>/g, "&gt;");
    	output = output.replace(/\n/g, "<br>");
    	output = output.replace(/\x1b\[90m/g, '</span><span class="comment">');
    	output = output.replace(/\x1b\[91m/g, '</span><span class="error">');
    	output = output.replace(/\x1b\[93m/g, '</span><span>');
    	output = output.replace(/\x1b\[96m/g, '</span><span>');
    	output = output.replace(/\x1b\[97m/g, '</span><span class="raw">');
    	output = output.replace(/\x1b\[1m/g, '</span><span>');
    	output = output.replace(/\x1b\[0m/g, '</span><span>');

    	output = '<span class="raw">' + output + "</span>";
      logEditor.innerHTML = output;
      return false;
    }
  }

  loadCharmapMif(mif) {
    this.#charmap = parseCharmap(charmap);
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

    memEditor.childNodes.forEach((el) => el.remove());
    memEditor.appendChild(emulator.renderMemory());

    this.updateRegisters();
    this.updateCursor();

    ctx.fill = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  tick(n) {
    let clocks = 0;

    while (clocks < n) {
      if (this.#isHalted) return false;
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

  renderMemoryBlock(data, region_name, originOffset = 0, cells) {
    const rows = data.length / 16;

    const region = document.createElement("details");
    const name = document.createElement("summary");
    const block = document.createElement("div");
    const address = document.createElement("div");
    const hex = document.createElement("div");
    const char = document.createElement("div");
  
    const offset = (data.byteOffset - originOffset) / 2;

    region.classList.add("memory");
    block.classList.add("region");
    address.classList.add("address");
    hex.classList.add("hex");
    char.classList.add("char");
  
    name.innerText = `${region_name} (${data.length} B)`;

    const group = [];

    for (let i = 0; i < data.length; i++) {
      const n = data[i];
      const span0 = document.createElement("span");
      span0.innerText = n.toString(16).padStart(4, "0").toUpperCase();
      span0.dataset.address = offset + i;

      hex.appendChild(span0);

      const span1 = document.createElement("span");
      if (n >= 32 & n <= 126) {
        span1.innerText = String.fromCharCode(n);      
      } else {
        span1.innerText = ".";
      }
      span1.dataset.address = offset + i;
      char.appendChild(span1);
      group.push([span0, span1]);
    }

    for (let i = 0; i < rows; i++) {
      const span = document.createElement("span");
      span.innerText = (offset + 16 * i).toString(16).padStart(4, "0").toUpperCase();
      address.appendChild(span);
    }

    block.appendChild(address);
    block.appendChild(hex);
    block.appendChild(char);
  
    region.appendChild(name);
    region.appendChild(block);

    cells.splice(0, 0, group);
  
    return region;
  }

  renderMemory() {
    const div = document.createElement("div");
  
    let memory = this.memory;
    let end = memory.length;
    let cells = [];

    this.regions
      .reverse()
      .map(([name, offset]) => {
        const data = memory.subarray(offset, end);
        end = offset;
        return this.renderMemoryBlock(data, name, memory.byteOffset, cells);
      })
      .reverse()
      .forEach((block) => {
        div.appendChild(block);
      });

    this.#cells = cells.flat();

    let last = 0;
    div.addEventListener("pointermove", (ev) => {
      {
        const [hex, ascii] = this.#cells[last];

        hex.classList.toggle("hover", false);
        ascii.classList.toggle("hover", false);
      }

      if (ev.target.dataset.address === undefined) return;
      last = ev.target.dataset.address;
      const [hex, ascii] = this.#cells[last];

      hex.classList.toggle("hover", true);
      ascii.classList.toggle("hover", true);
    });

    return div;
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
        const [hex, ascii] = this.#cells[args[0]];
        hex.innerText = args[1].toString(16).padStart(4, "0").toUpperCase();

        if (args[1] >= 32 & args[1] <= 126) {
          ascii.innerText = String.fromCharCode(args[1]);      
        } else {
          ascii.innerText = ".";
        }
        break;
      case "read":
        return key;
      default:
        console.log("cb", ...arguments);
    }
  }

  write(char, offset) {
    ctx.putImageData(this.#charmap, (offset % 40) * 8, Math.floor(offset / 40 - char) * 8, 0, char * 8, 8, 8);
  }

  get pc() {
    return this.registers[10];
  }

  get sp() {
    return this.registers[9];
  }

  updateCursor() {
    if (!this.#cells) return;

    this.#cells[this.#old_pc].forEach((el) => el.classList.toggle("pc", this.#old_pc == this.pc));
    this.#cells[this.#old_sp].forEach((el) => el.classList.toggle("sp", this.#old_sp == this.sp));

    this.#cells[this.pc].forEach((el) => el.classList.toggle("pc", true));
    this.#cells[this.sp].forEach((el) => el.classList.toggle("sp", true));

    this.#old_pc = this.pc;
    this.#old_sp = this.sp;
  }

  updateRegisters() {
    const registers = this.registers;
    for (let i = 0; i < registers.length; i++) {
      regEditor.elements[i].value = registers[i].toString(16).padStart(4, "0").toUpperCase();
    }
  }
}

const code = await (await fetch("./assets/example.asm")).text();
const charmap = await (await fetch("./assets/charmap.mif")).text();
const emulator = new Emulator();

require.config({
  paths: {
    vs: "scripts/modules/monaco-editor/min/vs"
  }
});

require(["vs/editor/editor.main", "vs/editor/editor.main.nls"], function () {
  asmEditor = monaco.editor.create(document.getElementById("asm-editor"), {
    language: "asm",
    theme: "vs-dark",
    fontFamily: "ui-monospace",
    fontSize: 16
  });

  asmEditor.setValue(code);
});

let ticks_missing = 0;
let last_tick;
let last_check;
let ticks = 0;
let play_interval;

window.play = function() {
  last_tick = performance.now();

  play_interval = setInterval(function() {
    ticks_missing += (performance.now() - last_tick) * clock * 1e-3;
    last_tick = performance.now();

    const result = emulator.tick(ticks_missing);

    if (!result) {
      clearInterval(play_interval);
      return;
    }

    ticks_missing -= result;
    ticks += result;
  }, 0);

  setInterval(function() {
    const now = performance.now();

    if (last_check) {
      console.log(1e3 * ticks / (now - last_check), "Hz");
    }

    ticks = 0;
    last_check = now;
  }, 1000);
}

window.compile = function() {
  emulator.loadAsm(asmEditor.getValue());
};

window.reset = function() {
  return emulator.reset();  
}

window.next = function() {
  return emulator.tick(1);
}

window.exportMif = function() {
  const ok = emulator.loadAsm(asmEditor.getValue());

  if (!ok) return;

  const blob = new Blob([emulator.exportMif()], { type: "text/x-mif" });
  download(blob, "program.mif");
}

window.downloadAsm = function() {
  const blob = new Blob([asmEditor.getValue()], { type: "text/x-asm" });
  download(blob, "program.asm");
}

window.stop = function() {
  if (!play_interval) return;
  clearInterval(play_interval);
}

function draw() {
  emulator.update();
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
emulator.loadCharmapMif(charmap);

setCallback(function() {
  return emulator.callback(...arguments);
});

window.addEventListener("keydown", function(event) {
  key = event.keyCode;
});

window.addEventListener("keyup", function() {
  key = 255;
});
