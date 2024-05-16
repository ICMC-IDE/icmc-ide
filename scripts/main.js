import initBackend, * as backend from "./modules/backend/backend.js";
import { setCallback } from "./modules/ide.js";

const memEditor = document.getElementById("mem-editor");
const regEditor = document.getElementById("reg-editor");
const logEditor = document.getElementById("log-editor");
const frequency = document.getElementById("frequency");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let asmEditor;

const modules = await Promise.all([initBackend()]);
const names = ["1 Hz", "10 Hz", "100 Hz", "1 kHz", "10 kHz", "100 kHz", "1 MHz", "10 MHz", "100 MHz", "FAST!"];

let interval = 1e-3;

frequency.addEventListener("input", function() {
  if (this.valueAsNumber == 9) {
    interval = 0;
  } else {
    interval = 1e3 * (10 ** -this.valueAsNumber);
  }
  this.nextSibling.innerText = names[this.valueAsNumber];
});

frequency.nextSibling.innerText = names[frequency.valueAsNumber];

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

      this.#bin = result.binary();
      this.#symbols = result.symbols();

      console.log(result);

      this.reset();
      logEditor.innerHTML = "";
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

  tick() {
    const pc = this.pc;
    const sp = this.sp;

    if (this.#isHalted) return false;
    this.#vm.tick();

    this.#cells[pc].forEach((el) => el.classList.toggle("pc", pc == this.pc));
    this.#cells[sp].forEach((el) => el.classList.toggle("sp", sp == this.sp));

    this.updateRegisters();
    this.updateCursor(pc, sp);

    return true;
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

  updateCursor(pc = 0, sp = 1 << 16 - 1) {
    this.#cells[pc].forEach((el) => el.classList.toggle("pc", pc == this.pc));
    this.#cells[sp].forEach((el) => el.classList.toggle("sp", sp == this.sp));

    this.#cells[this.pc].forEach((el) => el.classList.toggle("pc", true));
    this.#cells[this.sp].forEach((el) => el.classList.toggle("sp", true));
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


let halted = false;
let running = false;

setCallback(function() {
  return emulator.callback(...arguments);
});

window.compile = function() {
  emulator.loadAsm(asmEditor.getValue());
};

window.play = function() {
  if (!window.next()) return;

  setTimeout(window.play, interval);
}

window.reset = function() {
  return emulator.reset();  
}

window.next = function() {
  return emulator.tick();
}

emulator.loadCharmapMif(charmap);
