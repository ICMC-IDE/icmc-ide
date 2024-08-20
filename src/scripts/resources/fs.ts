import EventManager from "../state/event.js";

const FS_STORAGE_PREFIX = "file";
const ASSETS_DIR = "assets";
const ASSETS_LIST_PATH = ASSETS_DIR + "/assets.json";

export interface FsEventMap {
  create: string;
  update: { path: string; content: string };
  delete: string;
}

class FsObject {
  name: string;
  id: string;
  parent: FsObject | Fs;
  fs: Fs;

  constructor(name: string, parent: FsObject | Fs) {
    this.name = name;
    this.id = Math.floor(Math.random() * 1000000).toString();
    this.parent = parent;
    this.fs = parent instanceof Fs ? parent : parent.fs;
  }
}

export class FsFile extends FsObject {
  content: string;

  constructor(name: string, content: string, parent: FsObject | Fs) {
    super(name, parent);
    this.content = content;
  }

  save() {
    this.fs.write(this.id, this.content);
  }
}

export class FsFolder extends FsObject {
  children: Record<string, FsFile | FsFolder> = {};

  createFile(name: string, content: string): FsFile {
    const file = new FsFile(name, content, this);
    this.children[name] = file;
    return file;
  }

  open(path: string, resolve = true): FsFile | FsFolder | null {
    if (resolve) {
      const parts = path.split("/");

      const current = parts.shift();
      if (current === undefined) {
        return this;
      }

      if (Object.keys(this.children).includes(current)) {
        const child = this.children[current];
        if (child instanceof FsFolder) {
          return child.open(parts.join("/"));
        } else {
          return child;
        }
      }

      return null;
    }

    return this.children[path] ?? null;
  }

  save() {
    console.log(Object.keys(this.children));
    for (const key in Object.keys(this.children)) {
      this.children[key].save();
    }
  }
}

export default class Fs extends EventManager<FsEventMap> {
  #id;
  #prefix;
  root;

  constructor(id: string) {
    super();

    this.root = new FsFolder("", this);

    this.#id = id;
    this.#prefix = `${FS_STORAGE_PREFIX}:${id}:`;
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

  rename(pathOld: string, pathNew: string) {
    let content = this.read(pathOld);
    if (content === null) {
      content = "";
    }

    this.delete(pathOld);
    this.write(pathNew, content);
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

  async loadAssets() {
    const assets = (
      (await (await fetch(ASSETS_LIST_PATH)).json()) as Record<string, string[]>
    )[this.#id];
    // const files = this.files();

    await Promise.all(
      assets.map((asset) => {
        // if (!overwrite && files.includes(asset)) {
        //   return;
        //}

        fetch(ASSETS_DIR + "/" + asset)
          .then((response) => response.text())
          .then((content) => this.root.createFile(asset, content));
      }),
    );
    this.root.save();
  }
}
