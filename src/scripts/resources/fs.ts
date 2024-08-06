import EventManager from "../state/event.js";
import { fetchAssets } from "./assets.js";

const FILE_STORAGE_PREFIX = "file:";

export interface FsEventMap {
  create: string;
  update: { path: string; content: string };
  delete: string;
}

export default class Fs extends EventManager<FsEventMap> {
  read(path: string): string | null {
    return localStorage.getItem(FILE_STORAGE_PREFIX + path);
  }

  write(path: string, content: string): void {
    const exists = localStorage.getItem(FILE_STORAGE_PREFIX + path) !== null;
    localStorage.setItem(FILE_STORAGE_PREFIX + path, content);

    if (!exists) {
      this.emmit("create", path);
    }

    this.emmit("update", { path, content });
  }

  delete(path: string): void {
    localStorage.removeItem(FILE_STORAGE_PREFIX + path);
    this.emmit("delete", path);
  }

  files(): string[] {
    return Array.from(localStorage, (_, i) => localStorage.key(i))
      .filter((key) => typeof key === "string")
      .filter((key) => key.startsWith(FILE_STORAGE_PREFIX))
      .sort()
      .map((key) => key.substring(FILE_STORAGE_PREFIX.length));
  }

  all() {
    return Object.fromEntries(
      Array.from(localStorage, (_, i) => localStorage.key(i))
        .filter((key) => typeof key === "string")
        .filter((key) => key.startsWith(FILE_STORAGE_PREFIX))
        .sort()
        .map((key) => [
          key.substring(FILE_STORAGE_PREFIX.length),
          localStorage.getItem(key)!,
        ]),
    );
  }

  async loadAssets(overwrite = false) {
    const assets = await fetchAssets();
    const files = this.files();

    for (const asset in assets) {
      if (!overwrite && files.includes(asset)) {
        continue;
      }
      this.write(asset, assets[asset]);
    }
  }
}
