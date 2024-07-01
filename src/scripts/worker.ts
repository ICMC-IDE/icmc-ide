import { setCallback } from "./ide.js";

const { default: initBackend, Emulator, State, Fs, Assembler, Compiler } = await import("../modules/backend/backend.js");

let lastTick: number;

let ticksHandled = 0;
let ticksPending = 0;

let lastCheck: number;
let playInterval: NodeJS.Timeout | undefined;
let frequency = 1e6;

const modules = await Promise.all([initBackend()]);
const assets = await Promise.all((await Promise.all(["icmc.asm", "giroto.asm"].map((filename) => fetch(`../assets/${filename}`)))).map((data) => data.text()));
const emulator = new Emulator();
const fs = new Fs();

const memories = {
  _ram: new Uint16Array(modules[0].memory.buffer, emulator.ram(), 0x10000),
  _vram: new Uint16Array(modules[0].memory.buffer, emulator.vram(), 0x10000),
  _registers: new Uint16Array(modules[0].memory.buffer, emulator.registers(), 8),
  _internalRegisters: new Uint16Array(modules[0].memory.buffer, emulator.internal_registers(), 64),

  get ram() {
    if (this._ram.length === 0) {
      return this._ram = new Uint16Array(modules[0].memory.buffer, emulator.ram(), 0x10000);
    }

    return this._ram;
  },

  get vram() {
    if (this._vram.length === 0) {
      return this._vram = new Uint16Array(modules[0].memory.buffer, emulator.vram(), 0x10000);
    }

    return this._vram;
  },

  get registers() {
    if (this._registers.length === 0) {
      return this._registers = new Uint16Array(modules[0].memory.buffer, emulator.registers(), 8);
    }

    return this._registers;
  },

  get internalRegisters() {
    if (this._internalRegisters.length === 0) {
      return this._internalRegisters = new Uint16Array(modules[0].memory.buffer, emulator.internal_registers(), 64);
    }

    return this._internalRegisters;
  },
};

self.addEventListener("message", function({ data }) {
  if (typeof data === "string") {
    switch (data) {
      case "play":
        return play();
      case "stop":
        return stop();
      case "reset":
        return reset();
      case "next":
        return next();
      default:
        console.log(data);
    }
  } else {
    switch (data[0]) {
      case "build":
        return build(data[1]);
        break;
      case "frequency":
        frequency = 10 ** data[1];
        break;
      default:
        console.log(data);
    }
  }
});

fs.writeFile("icmc.asm", assets[0]);
fs.writeFile("giroto.asm", assets[1]);

function build({ language, syntax, source }: {language: string, syntax: string, source: string}) {
  try {
    let asm = source;
    switch (language) {
      case "asm":
        fs.writeFile("program.asm", source);
        break;
      case "c":
        fs.writeFile("program.c", source);
        asm = Compiler.compile(fs, "program.c");
        fs.writeFile("program.asm", asm);
        break
    }

    const result = Assembler.assemble(fs, `${syntax}.asm:program.asm`);;

    emulator.load(result.binary());
    emulator.reset();

    self.postMessage(["build", {
      ram: memories.ram,
      vram: memories.vram,
      registers: memories.registers,
      internalRegisters: memories.internalRegisters,
      symbols: result.symbols(),
    }]);

    self.postMessage(["asmsource", asm]);
  } catch (error) {
    self.postMessage(["build", { error }]);
  }
}

function reset() {
  stop();
  return emulator.reset();
}

function play() {
  if (playInterval) return;

  self.postMessage("play");

  lastTick = performance.now();
  playInterval = setInterval(function() {
    ticksPending += (performance.now() - lastTick) * frequency * 1e-3;
    lastTick = performance.now();

    if (ticksPending > 100000) {
      ticksPending = 100000;
    }

    const ticks = emulator.tick(ticksPending);

    if (emulator.state() !== State.Paused) {
      return stop();
    }

    ticksHandled += ticks;
    ticksPending -= ticks;
  }, 0);
}

function stop() {
  if (!playInterval) return;

  self.postMessage("stop");
  clearInterval(playInterval);
  playInterval = undefined;
}

function next() {
  return emulator.tick(1);
}

setCallback((name, ...args) => {
  switch (name) {
    case "store":
      self.postMessage([...args]);
      break;
    default:
      console.log("cb", ...args);
  }
});

setInterval(function() {
  const now = performance.now();

  if (lastCheck) {
    const currentFrequency = 1e3 * ticksHandled / (now - lastCheck);
    console.info("%c%s %cHz | %c%s", "color: cyan", currentFrequency.toFixed(2), "color: white", "color: yellow", (currentFrequency / frequency).toFixed(4));
  }

  ticksHandled = 0;
  lastCheck = now;
}, 1000);
