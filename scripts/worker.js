import initBackend, { Emulator, State, Fs, Assembler, Compiler } from "./modules/backend/backend.js";
import { setCallback } from "./modules/ide.js";

let lastTick;
let keyPressed = 255;

let ticksHandled = 0;
let ticksPending = 0;

let lastCheck;
let playInterval;
let frequency = 1e6;

const modules = await Promise.all([initBackend()]);

self.addEventListener("message", function ({ data }) {
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
        return build(data[1], data[2]);
      case "key":
        keyPressed = data[1];
        break;
      case "frequency":
        frequency = 10 ** data[1];
        break;
      default:
        console.log(data);
    }
  }
});

const assets = await Promise.all((await Promise.all(["icmc.asm", "giroto.asm"].map((filename) => fetch(`../assets/${filename}`)))).map((data) => data.text()));
const emulator = new Emulator();
const fs = new Fs();

fs.writeFile("icmc.asm", assets[0]);
fs.writeFile("giroto.asm", assets[1]);

function build({ language, syntax, source }) {
  try {
    if (language === "asm") {
      fs.writeFile("program.asm", source);
    } else if (language === "c") {
      fs.writeFile("program.c", source);
      const asm = Compiler.compile(fs, "program.c");
      fs.writeFile("program.asm", asm);
    }

    const result = Assembler.assemble(fs, `${syntax}.asm:program.asm`);;

    emulator.load(result.binary());
    emulator.reset();

    self.postMessage(["registers", registers()]);
    self.postMessage(["memory", memory(), result.symbols()]);
  } catch (error) {
    self.postMessage(["log", error]);
  }
}

function reset() {
  self.postMessage(["memory", memory()]);
  return emulator.reset();
}

function play() {
  if (playInterval) return;

  self.postMessage("play");

  lastTick = performance.now();
  playInterval = setInterval(function () {
    ticksPending += (performance.now() - lastTick) * frequency * 1e-3;
    lastTick = performance.now();

    if (ticksPending > 10000) {
      ticksPending = 10000;
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

let memoryArray = new Uint16Array(modules[0].memory.buffer, emulator.memory(), 0x10000);
function memory() {
  if (memoryArray.length === 0) {
    memoryArray = new Uint16Array(modules[0].memory.buffer, emulator.memory(), 0x10000);
  }

  return memoryArray;
}

let registersArray = new Uint16Array(modules[0].memory.buffer, emulator.registers(), 12);
function registers() {
  if (registersArray.length === 0) {
    registersArray = new Uint16Array(modules[0].memory.buffer, emulator.registers(), 12);
  }

  return registersArray;
}

function loadMif(program) {
  parseMif(memory(), program);
}

setCallback(function (name, ...args) {
  switch (name) {
    case "write":
      self.postMessage([...arguments]);
      break;
    case "halt":
      self.postMessage("stop");
      break;
    case "store":
      break;
    case "read":
      return keyPressed;
    case "breakpoint":
      return stop();
    default:
      console.log("cb", ...arguments);
  }
});

setInterval(function () {
  const now = performance.now();

  if (lastCheck) {
    console.info(1e3 * ticksHandled / (now - lastCheck), "Hz");
  }

  ticksHandled = 0;
  lastCheck = now;
}, 1000);
