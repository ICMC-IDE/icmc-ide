import {
  parseMif,
  Emulator,
  State,
  Assembler,
  modules,
  Compiler,
} from "./prelude.js";

function getEmulatorMemories(emulator: Emulator) {
  const buffer = modules.emulator.memory.buffer;

  return {
    ram: new Uint16Array(buffer, emulator.ram(), 0x10000),
    vram: new Uint16Array(buffer, emulator.vram(), 0x10000),
    registers: new Uint16Array(buffer, emulator.registers(), 0x8),
    internalRegisters: new Uint16Array(
      buffer,
      emulator.internal_registers(),
      0x40,
    ),
  };
}

const emulator = new Emulator();

let lastTick: number;

let ticksHandled = 0;
let ticksPending = 0;

let lastCheck: number;
let playInterval: NodeJS.Timeout | undefined;
let frequency = 1e6;

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

    if (ticksPending > 1_000_000) {
      ticksPending = 1_000_000;
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

interface Message {
  id: number;
  error?: string;
  content?: ReturnType<(typeof actions)[keyof typeof actions]>;
}

const fs = {
  _files: {} as Record<string, string>,

  read(filename: string) {
    return this._files[filename];
  },

  write(filename: string, data: string) {
    this._files[filename] = data;
  },

  files(): string[] {
    return Object.keys(this._files);
  },
};

function build({
  entry,
  files,
  syntax,
}: {
  entry: string;
  files: { [index: string]: string };
  syntax: string;
}) {
  fs._files = files;

  const language = entry.match(/\.([^.]+)$/)![1].toLowerCase();
  let asm;

  if (language === "c") {
    asm = Compiler.compile(fs, entry);
    fs.write((entry += ".asm"), asm);
  }

  const assembly = Assembler.assemble(fs, `syntax/${syntax}.asm:${entry}`);
  emulator.load(assembly.binary());

  const result = {
    mif: assembly.mif(),
    symbols: assembly.symbols(),
    asm,
    ...getEmulatorMemories(emulator),
  };

  return result;
}

const actions = {
  build,
  play,
  stop,
  reset,
  next,
  "parse-mif": parseMif,
  "set-frequency": setFrequency,
};

function setFrequency(value: number) {
  frequency = 10 ** value;
}

self.addEventListener(
  "message",
  function ({
    data: { type, id, content },
  }: {
    data: {
      type: keyof typeof actions;
      id: number;
      content: Parameters<(typeof actions)[keyof typeof actions]>;
    };
  }) {
    const message: Message = { id };

    try {
      const action = actions[type];

      if (action) {
        // @ts-ignore
        // FIXME
        message.content = action(content);
      } else {
        message.error = `Unknown request type '${type}' with id ${id}`;
      }
    } catch (error: unknown) {
      message.error = error!.toString();
    }

    self.postMessage({
      type: "response",
      content: message,
    });
  },
);

self.postMessage({ type: "ready" });
