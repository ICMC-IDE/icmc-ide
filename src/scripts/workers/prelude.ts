import initMif from "@icmc-ide/mif";
import initAssembler from "@icmc-ide/assembler";
import initEmulator from "@icmc-ide/icmc-emulator";
import initCompiler from "@icmc-ide/icmc-cc";

const mif = initMif();
const assembler = initAssembler();
const emulator = initEmulator();
const compiler = initCompiler();

export const modules = {
  mif: await mif,
  assembler: await assembler,
  emulator: await emulator,
  compiler: await compiler,
};

export { Mif, parseMif, Radix } from "@icmc-ide/mif";
export { assemble } from "@icmc-ide/assembler";
export { Emulator, State } from "@icmc-ide/icmc-emulator";
export { Compiler } from "@icmc-ide/icmc-cc";
