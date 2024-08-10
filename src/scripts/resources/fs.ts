import EventManager from "../state/event.js";

const FILE_STORAGE_PREFIX = "file:";
const ASSETS_DIR = "assets";
const ASSETS_LIST_PATH = ASSETS_DIR + "/assets.json";

export interface FsEventMap {
  create: string;
  update: { path: string; content: string };
  delete: string;
}

export default class Fs extends EventManager<FsEventMap> {
  #id;
  #prefix;

  constructor(id: string) {
    super();

    this.#id = id;
    this.#prefix = `${FILE_STORAGE_PREFIX}:${id}:`;
  }

  read(path: string): string | null {
    return localStorage.getItem(this.#prefix + path);
  }

  readJSON<T>(path: string): T | null {
    const data = this.read(path);
    return data === null ? null : <T>JSON.parse(data);
  }

  write(path: string, content: string): void {
    const exists = localStorage.getItem(this.#prefix + path) !== null;
    localStorage.setItem(this.#prefix + path, content);

    if (!exists) {
      this.emmit("create", path);
    }

    this.emmit("update", { path, content });
  }

  delete(path: string): void {
    localStorage.removeItem(this.#prefix + path);
    this.emmit("delete", path);
  }

  files(): string[] {
    return Array.from(localStorage, (_, i) => localStorage.key(i))
      .filter((key) => typeof key === "string")
      .filter((key) => key.startsWith(this.#prefix))
      .sort()
      .map((key) => key.substring(this.#prefix.length));
  }

  all() {
    return Object.fromEntries(
      Array.from(localStorage, (_, i) => localStorage.key(i))
        .filter((key) => typeof key === "string")
        .filter((key) => key.startsWith(this.#prefix))
        .sort()
        .map((key) => [
          key.substring(this.#prefix.length),
          localStorage.getItem(key)!,
        ]),
    );
  }

  async loadAssets(overwrite = false) {
    const assets = (
      (await (await fetch(ASSETS_LIST_PATH)).json()) as Record<string, string[]>
    )[this.#id];
    const files = this.files();

    await Promise.all(
      assets.map((asset) => {
        if (!overwrite && files.includes(asset)) {
          return;
        }

        fetch(ASSETS_DIR + "/" + asset)
          .then((response) => response.text())
          .then((content) => this.write(asset, content));
      }),
    );
  }
}
