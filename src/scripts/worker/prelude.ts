import initMif from "../../modules/mif/mif.js";
import initAssembler from "../../modules/assembler/assembler.js";
import initEmulator from "../../modules/icmc-emulator/icmc_emulator.js";
import initCompiler from "../../modules/icmc-cc/icmc_cc.js";

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

export { parseMif } from "../../modules/mif/mif.js";
export { Assembler } from "../../modules/assembler/assembler.js";
export { Emulator, State } from "../../modules/icmc-emulator/icmc_emulator.js";
export { Compiler } from "../../modules/icmc-cc/icmc_cc.js";
