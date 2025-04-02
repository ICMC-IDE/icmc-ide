import { VirtualFileSystemDirectory } from "../resources/fs.js";
import {
  assemble,
  Compiler,
  Emulator,
  Mif,
  modules,
  parseMif,
  Radix,
  State,
} from "./prelude.js";

type Actions = typeof actions;

type Message<T extends keyof Actions> =
  | {
      id: number;
      error: string;
    }
  | { id: number; content: Actions[T] };

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

// TODO: solve rust FS async issues
class Fs {
  #root: VirtualFileSystemDirectory;
  #files: Record<string, string> = {};

  constructor(root: VirtualFileSystemDirectory) {
    this.#root = root;
  }

  async init(files: string[]) {
    for (const file of files) {
      this.#files[file] = await (await this.#root.getFile(file)).read();
    }
  }

  clear() {
    this.#files = {};
  }

  read(path: string) {
    return this.#files[path];
  }

  async write(path: string, data: string) {
    this.#files[path] = data;
    const file = await this.#root.createFile(path, true);
    return await file.write(data);
  }

  files() {
    return Object.keys(this.#files);
  }
}

const fs = new Fs(
  new VirtualFileSystemDirectory(
    "",
    undefined,
    await navigator.storage.getDirectory(),
  ),
);

async function build({ file, syntax }: { file: string; syntax: string }) {
  // TODO: Support multiple files (for imports)
  const language = file.match(/\.([^.]+)$/)![1].toLowerCase();
  let asm;

  await fs.init([file, `internal/syntax/${syntax}.toml`]);

  // TODO: Improve this
  if (language === "c") {
    asm = Compiler.compile(fs, file);
    await fs.write((file += ".asm"), asm);
  }

  const assembly = assemble(fs, file, `internal/syntax/${syntax}.toml`);

  emulator.load(assembly.binary());

  // console.log(Mif.encodeUint16Array(assembly.binary(), Radix.Uns, Radix.Bin));
  // console.log(assembly.symbols());

  const result = {
    mif: assembly.mif(),
    symbols: assembly.symbols(),
    asm,
    ...getEmulatorMemories(emulator),
  };

  fs.clear();
  return result;
}

const actions = {
  build,
  play,
  stop,
  reset,
  next,
  parseMif,
  encodeMif8: (data: Uint8Array) =>
    Mif.encodeUint8Array(data, Radix.Uns, Radix.Bin),
  setFrequency,
};

function setFrequency(value: number) {
  frequency = 10 ** value;
}

self.addEventListener(
  "message",
  async <T extends keyof Actions>({
    data: { type, id, content },
  }: {
    data: {
      type: T;
      id: number;
      content: Parameters<Actions[T]>[0];
    };
  }) => {
    let message: Message<T>;

    //try {
    const action = actions[type] as Actions[T];

    if (action) {
      // @ts-ignore
      // FIXME
      try {
        message = {
          id,
          // @ts-ignore
          content: await action(content),
        };
      } catch (error: unknown) {
        message = {
          id,
          error: error!.toString(),
        };
      }
    } else {
      message = {
        id,
        error: `Unknown request type '${type}' with id ${id}`,
      };
    }
    self.postMessage({
      type: "response",
      content: message,
    });
  },
);

self.postMessage({ type: "ready" });
