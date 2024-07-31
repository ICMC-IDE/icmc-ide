import { emulator, assembler, mif, compiler } from "./prelude.js";

// import EventManager from "../state/event.js";

/*
let lastTick: number;

let ticksHandled = 0;
let ticksPending = 0;

let lastCheck: number;
let playInterval: NodeJS.Timeout | undefined;
let frequency = 1e6;

const assets = await Promise.all(
  (
    await Promise.all(
      ["icmc.asm", "giroto.asm"].map((filename) =>
        fetch(`../assets/${filename}`),
      ),
    )
  ).map((data) => data.text()),
);
const emulator = new Emulator();
const fs = new Fs();

const memories = {
  _ram: new Uint16Array(modules[0].memory.buffer, emulator.ram(), 0x10000),
  _vram: new Uint16Array(modules[0].memory.buffer, emulator.vram(), 0x10000),
  _registers: new Uint16Array(
    modules[0].memory.buffer,
    emulator.registers(),
    8,
  ),
  _internalRegisters: new Uint16Array(
    modules[0].memory.buffer,
    emulator.internal_registers(),
    64,
  ),

  get ram() {
    if (this._ram.length === 0) {
      return (this._ram = new Uint16Array(
        modules[0].memory.buffer,
        emulator.ram(),
        0x10000,
      ));
    }

    return this._ram;
  },

  get vram() {
    if (this._vram.length === 0) {
      return (this._vram = new Uint16Array(
        modules[0].memory.buffer,
        emulator.vram(),
        0x10000,
      ));
    }

    return this._vram;
  },

  get registers() {
    if (this._registers.length === 0) {
      return (this._registers = new Uint16Array(
        modules[0].memory.buffer,
        emulator.registers(),
        8,
      ));
    }

    return this._registers;
  },

  get internalRegisters() {
    if (this._internalRegisters.length === 0) {
      return (this._internalRegisters = new Uint16Array(
        modules[0].memory.buffer,
        emulator.internal_registers(),
        64,
      ));
    }

    return this._internalRegisters;
  },
};


fs.writeFile("icmc.asm", assets[0]);
fs.writeFile("giroto.asm", assets[1]);

function build({
  language,
  syntax,
  source,
}: {
  language: string;
  syntax: string;
  source: string;
}) {
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
        break;
    }

    const result = Assembler.assemble(fs, `${syntax}.asm:program.asm`);

    emulator.load(result.binary());
    emulator.reset();

    self.postMessage([
      "build",
      {
        ram: memories.ram,
        vram: memories.vram,
        registers: memories.registers,
        internalRegisters: memories.internalRegisters,
        symbols: result.symbols(),
      },
    ]);

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
  playInterval = setInterval(function () {
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

setInterval(function () {
  const now = performance.now();

  if (lastCheck) {
    const currentFrequency = (1e3 * ticksHandled) / (now - lastCheck);
    console.info(
      "%c%s %cHz | %c%s",
      "color: cyan",
      currentFrequency.toFixed(2),
      "color: white",
      "color: yellow",
      (currentFrequency / frequency).toFixed(4),
    );
  }

  ticksHandled = 0;
  lastCheck = now;
}, 1000);
*/

interface Message {
  id: number;
  error?: string;
  content?: any;
}

self.addEventListener("message", function ({ data: { type, id, content } }) {
  const message: Message = { id };

  switch (type) {
    case "build":
      // return build(content);
      console.log(content);
      break;
    case "frequency":
      // frequency = 10 ** content;
      break;
    case "play":
      // return play();
      break;
    case "stop":
      // return stop();
      break;
    case "reset":
      // return reset();
      break;
    case "next":
      // return next();
      break;
    case "parse-mif":
      message.content = mif.parseMif(content);
      break;
    default:
      message.error = `Unknown request type '${type}' with id ${id}`;
  }

  self.postMessage({
    type: "response",
    content: message,
  });
});

self.postMessage({ type: "ready" });
