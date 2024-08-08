import { FileManagerFile } from "../types";
import ConfigManager from "./config.js";
import EventManager from "./event.js";
import CharMap from "../resources/charmap.js";
import ResourceManager from "./resources.js";
import Fs from "../resources/fs.js";
import MainWorker from "../resources/main-worker.js";

export interface GlobalState {
  eventManager: EventManager<GlobalEventsMap>;
  configManager: ConfigManager<GlobalConfigsMap>;
  resourceManager: ResourceManager<GlobalresourceManagerMap>;
}

export interface GlobalEventsMap {
  "delete-file": FileManagerFile;
  "open-file": FileManagerFile;
  "open-window": string;
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

export interface GlobalresourceManagerMap {
  "example.c": string;
  "example.asm": string;
  charmap: CharMap;
  fs: Fs;
  registers: Uint16Array;
  "internal-registers": Uint16Array;
  ram: Uint16Array;
  vram: Uint16Array;
  symbols: string;
  "main-worker": MainWorker;
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

const resourceManager = new ResourceManager<GlobalresourceManagerMap>();
const fs = new Fs();
const mainWorker = new MainWorker();
await Promise.all([fs.loadAssets(), mainWorker.isReady]);
resourceManager.set("fs", fs);
resourceManager.set("main-worker", mainWorker);

export default <GlobalState>{
  eventManager,
  configManager,
  resourceManager,
};
