import initMif from "../../modules/mif/mif.js";
import initAssembler from "../../modules/assembler/assembler.js";
import initEmulator from "../../modules/icmc-emulator/icmc_emulator.js";
import initCompiler from "../../modules/icmc-cc/icmc_cc.js";

export const modules = await Promise.all([
  initMif(),
  initAssembler(),
  initEmulator(),
  initCompiler(),
]);

export * as mif from "../../modules/mif/mif.js";
export * as assembler from "../../modules/assembler/assembler.js";
export * as emulator from "../../modules/icmc-emulator/icmc_emulator.js";
export * as compiler from "../../modules/icmc-cc/icmc_cc.js";
