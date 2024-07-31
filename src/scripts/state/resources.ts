import EventManager from "./event.js";
import CharMap from "../resources/charmap.js";
import Fs from "../resources/fs.js";
import MainWorker from "../resources/main-worker.js";
import { fetchAssets } from "../resources/assets.js";

export interface ResourceMap {
  "example.c": string;
  "example.asm": string;
  fs: Fs;
  charmap: CharMap;
  registers: Uint16Array;
  "internal-registers": Uint16Array;
  ram: Uint16Array;
  vram: Uint16Array;
  symbols: string;
  "main-worker": MainWorker;

  [name: string]: any;
}

export default class ResourceManager extends EventManager<ResourceMap> {
  #resources: Partial<ResourceMap> = {};

  get<K extends keyof ResourceMap>(config: K) {
    return this.#resources[config] as ResourceMap[K];
  }

  getMany<K extends keyof ResourceMap>(...args: K[]) {
    return args.map((key) => this.#resources[key]);
  }

  set<K extends keyof ResourceMap>(config: K, value: ResourceMap[K]) {
    this.emmit(config, (this.#resources[config] = value));
  }

  update<K extends keyof ResourceMap>(
    config: K,
    func: (current: ResourceMap[K]) => ResourceMap[K],
  ) {
    this.emmit(
      config,
      (this.#resources[config] = func(this.#resources[config])),
    );
  }
}

export async function loadResources(): Promise<ResourceManager> {
  const resources = new ResourceManager();
  const mainWorker = new MainWorker();
  const fs = new Fs();
  const [assets] = await Promise.all([fetchAssets(), mainWorker.isReady]);

  resources.set("fs", fs);
  resources.set("main-worker", mainWorker);

  for (const [name, value] of Object.entries(assets)) {
    resources.set(name, value);
  }

  {
    const filenames = fs.files();

    for (const name of ["example.c", "example.asm", "charmap.mif"]) {
      if (filenames.includes(name)) continue;
      fs.write(name, assets[name]!);
    }
  }

  for (const name of ["giroto", "icmc"]) {
    fs.write(`syntax/${name}.asm`, assets[`${name}.asm`]);
  }

  return resources;
}
