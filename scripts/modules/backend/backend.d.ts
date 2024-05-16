/* tslint:disable */
/* eslint-disable */
/**
*/
export class Code {
  free(): void;
/**
* @param {string} src
*/
  constructor(src: string);
/**
* @returns {string}
*/
  symbols(): string;
/**
* @returns {Uint16Array}
*/
  binary(): Uint16Array;
}
/**
*/
export class Vm {
  free(): void;
/**
*/
  constructor();
/**
* @param {Uint16Array} rom
*/
  load(rom: Uint16Array): void;
/**
* @param {number} address
* @param {number} value
*/
  store(address: number, value: number): void;
/**
*/
  tick(): void;
/**
* @returns {number}
*/
  memory(): number;
/**
* @returns {number}
*/
  registers(): number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_vm_free: (a: number) => void;
  readonly vm_new: () => number;
  readonly vm_load: (a: number, b: number, c: number) => void;
  readonly vm_store: (a: number, b: number, c: number) => void;
  readonly vm_tick: (a: number) => void;
  readonly vm_memory: (a: number) => number;
  readonly vm_registers: (a: number) => number;
  readonly __wbg_code_free: (a: number) => void;
  readonly code_new: (a: number, b: number) => number;
  readonly code_symbols: (a: number, b: number) => void;
  readonly code_binary: (a: number, b: number) => void;
  readonly wasm_assemble: (a: number, b: number) => number;
  readonly wasm_get_version: () => number;
  readonly wasm_string_new: (a: number) => number;
  readonly wasm_string_drop: (a: number) => void;
  readonly wasm_string_get_len: (a: number) => number;
  readonly wasm_string_get_byte: (a: number, b: number) => number;
  readonly wasm_string_set_byte: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
