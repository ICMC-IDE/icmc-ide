import { FileManagerFile } from "types.js";
import ConfigManager from "./config.js";
import EventManager from "./event.js";
import CharMap from "../resources/charmap.js";
import ResourceManager from "./resources.js";
import Fs from "../resources/fs.js";
import MainWorker from "../resources/main-worker.js";

export interface GlobalState {
  eventManager: EventManager<GlobalEventsMap>;
  configManager: ConfigManager<GlobalConfigsMap>;
  resources: ResourceManager<GlobalResourcesMap>;
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
  "screen-width": number;
  "screen-height": number;
  frequency: number;
  "entry-file": string;
}

export interface GlobalResourcesMap {
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
  "screen-width": 40,
  "screen-height": 30,
  frequency: 6,
  "entry-file": "example.asm",
});
configManager.loadAll();

const resources = new ResourceManager<GlobalResourcesMap>();
const fs = new Fs();
const mainWorker = new MainWorker();
await Promise.all([fs.loadAssets(), mainWorker.isReady]);
resources.set("fs", fs);
resources.set("main-worker", mainWorker);

export default <GlobalState>{
  eventManager,
  configManager,
  resources,
};
