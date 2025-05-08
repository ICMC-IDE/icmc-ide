import ConfigManager from "./config.js";
import EventManager from "./event.js";
import CharMap from "../resources/charmap.js";
import ResourceManager from "./resources.js";
import MainWorker from "../resources/main-worker.js";
import {
  loadAssets,
  VirtualFileSystemDirectory,
  VirtualFileSystemFile,
} from "../resources/fs.js";
import { WindowsManager } from "../windows/mod.js";

export interface GlobalState {
  eventManager: EventManager<GlobalEventsMap>;
  configManager: ConfigManager<GlobalConfigsMap>;
  resourceManager: ResourceManager<GlobalResourcesMap>;
}

export interface GlobalEventsMap {
  fileDelete: VirtualFileSystemFile;
  fileOpen: VirtualFileSystemFile;
  build: VirtualFileSystemFile;
  windowOpen: string;
  error: Error;
  render: void;
  updateFs: void;
}

export interface GlobalConfigsMap {
  syntax: string;
  screenWidth: number;
  screenHeight: number;
  frequency: number;
  gridWidth: number;
  gridHeight: number;
  numbersFormat: number;
}

export interface GlobalResourcesMap {
  charmap: CharMap;
  fs: VirtualFileSystemDirectory;
  registers: Uint16Array;
  internalRegisters: Uint16Array;
  ram: Uint16Array;
  vram: Uint16Array;
  symbols: string;
  mainWorker: MainWorker;
  windowsManager: WindowsManager;
  cachedLog: Error | undefined;
}

const eventManager = new EventManager<GlobalEventsMap>();
const configManager = new ConfigManager<GlobalConfigsMap>("config", {
  syntax: "icmc",
  screenWidth: 40,
  screenHeight: 30,
  frequency: 1_000_000,
  gridWidth: 1,
  gridHeight: 1,
  numbersFormat: 16,
});
const resourceManager = new ResourceManager<GlobalResourcesMap>();

const globalState = {
  eventManager,
  configManager,
  resourceManager,
} as GlobalState;

configManager.loadAll();

const mainWorker = new MainWorker();
const fs = new VirtualFileSystemDirectory(
  "",
  undefined,
  await navigator.storage.getDirectory(),
);
await Promise.all([loadAssets(fs, true), mainWorker.isReady]);
resourceManager.set("fs", fs);
resourceManager.set("mainWorker", mainWorker);
resourceManager.set("windowsManager", new WindowsManager(globalState));

export default globalState;
