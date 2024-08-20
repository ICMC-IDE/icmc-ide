import { FileManagerFile } from "../types";
import ConfigManager from "./config.js";
import EventManager from "./event.js";
import CharMap from "../resources/charmap.js";
import ResourceManager from "./resources.js";
import Fs, { FsFile } from "../resources/fs.js";
import MainWorker from "../resources/main-worker.js";

export interface GlobalState {
  eventManager: EventManager<GlobalEventsMap>;
  configManager: ConfigManager<GlobalConfigsMap>;
  resourceManager: ResourceManager<GlobalResourcesMap>;
}

export interface GlobalEventsMap {
  fileDelete: FileManagerFile;
  fileOpen: FsFile;
  windowOpen: string;
  error: Error;
  render: void;
}

export interface GlobalConfigsMap {
  syntax: string;
  screenWidth: number;
  screenHeight: number;
  frequency: number;
  entryFile: string;
  gridWidth: number;
  gridHeight: number;
}

export interface GlobalResourcesMap {
  charmap: CharMap;
  fs: {
    internal: Fs;
    user: Fs;
  };
  registers: Uint16Array;
  internalRegisters: Uint16Array;
  ram: Uint16Array;
  vram: Uint16Array;
  symbols: string;
  mainWorker: MainWorker;
}

const eventManager = new EventManager<GlobalEventsMap>();

const configManager = new ConfigManager<GlobalConfigsMap>({
  syntax: "icmc",
  screenWidth: 40,
  screenHeight: 30,
  frequency: 6,
  entryFile: "example.asm",
  gridWidth: 30,
  gridHeight: 30,
});
configManager.loadAll();

const resourceManager = new ResourceManager<GlobalResourcesMap>();
const internalFs = new Fs("internal");
const userFs = new Fs("user");
const mainWorker = new MainWorker();
await Promise.all([
  internalFs.loadAssets(),
  userFs.loadAssets(),
  mainWorker.isReady,
]);
resourceManager.set("fs", { internal: internalFs, user: userFs });
resourceManager.set("mainWorker", mainWorker);

export default <GlobalState>{
  eventManager,
  configManager,
  resourceManager,
};
