/* tslint:disable */
/* eslint-disable */
/**
*/
export enum State {
  Paused = 0,
  BreakPoint = 1,
  Halted = 2,
}
/**
*/
export class Assembler {
  free(): void;
/**
* @param {Fs} fs
* @param {string} filenames
* @returns {Assembly}
*/
  static assemble(fs: Fs, filenames: string): Assembly;
}
/**
*/
export class Assembly {
  free(): void;
/**
* @returns {string}
*/
  symbols(): string;
/**
* @returns {Uint16Array}
*/
  binary(): Uint16Array;
/**
* @returns {string}
*/
  mif(): string;
}
/**
*/
export class Compiler {
  free(): void;
/**
* @param {Fs} fs
* @param {string} filenames
* @returns {string}
*/
  static compile(fs: Fs, filenames: string): string;
}
/**
* Reseting the Emulator is a common task, therefore it is convenient to have a copy of the original memory
*/
export class Emulator {
  free(): void;
/**
*/
  constructor();
/**
* @param {Uint16Array} rom
*/
  load(rom: Uint16Array): void;
/**
*/
  reset(): void;
/**
* @returns {State}
*/
  state(): State;
/**
* @param {number} address
* @param {number} value
*/
  store(address: number, value: number): void;
/**
* @param {number} ticks
* @returns {number}
*/
  tick(ticks: number): number;
/**
* @returns {number}
*/
  registers(): number;
/**
* @returns {number}
*/
  rom(): number;
/**
* @returns {number}
*/
  ram(): number;
/**
* @returns {number}
*/
  vram(): number;
}
/**
*/
export class Fs {
  free(): void;
/**
*/
  constructor();
/**
* @param {string} filename
* @param {string} contents
*/
  writeFile(filename: string, contents: string): void;
/**
* @param {string} filename
* @returns {string | undefined}
*/
  readFile(filename: string): string | undefined;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly __wbg_emulator_free: (a: number) => void;
  readonly emulator_new: () => number;
  readonly emulator_load: (a: number, b: number, c: number) => void;
  readonly emulator_reset: (a: number) => void;
  readonly emulator_state: (a: number) => number;
  readonly emulator_store: (a: number, b: number, c: number) => void;
  readonly emulator_tick: (a: number, b: number) => number;
  readonly emulator_registers: (a: number) => number;
  readonly emulator_rom: (a: number) => number;
  readonly emulator_ram: (a: number) => number;
  readonly emulator_vram: (a: number) => number;
  readonly compiler_compile: (a: number, b: number, c: number, d: number) => void;
  readonly __wbg_compiler_free: (a: number) => void;
  readonly __wbg_assembly_free: (a: number) => void;
  readonly assembler_assemble: (a: number, b: number, c: number, d: number) => void;
  readonly assembly_symbols: (a: number, b: number) => void;
  readonly assembly_binary: (a: number, b: number) => void;
  readonly assembly_mif: (a: number, b: number) => void;
  readonly __wbg_assembler_free: (a: number) => void;
  readonly __wbg_fs_free: (a: number) => void;
  readonly fs_new: () => number;
  readonly fs_writeFile: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly fs_readFile: (a: number, b: number, c: number, d: number) => void;
  readonly wasm_assemble: (a: number, b: number) => number;
  readonly wasm_get_version: () => number;
  readonly wasm_string_new: (a: number) => number;
  readonly wasm_string_drop: (a: number) => void;
  readonly wasm_string_get_len: (a: number) => number;
  readonly wasm_string_get_byte: (a: number, b: number) => number;
  readonly wasm_string_set_byte: (a: number, b: number, c: number) => void;
  readonly memory: WebAssembly.Memory;
  readonly __wbindgen_export_1: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_thread_destroy: (a?: number, b?: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput, maybe_memory?: WebAssembly.Memory): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>, maybe_memory?: WebAssembly.Memory): Promise<InitOutput>;
