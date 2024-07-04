import { EventHandler } from "./types";

class Field<T> {
  #handlers: EventHandler<T | null>[] = [];
  #value: T | null = null;
  #name: string;

  static async async_with<T>(name: string, defaultValue: () => Promise<T>) {
    const storedValue = localStorage.getItem(name);

    try {
      if (storedValue !== null) {
        return new this(name, JSON.parse(storedValue));
      }
      return new this(name, await defaultValue());
    } catch(_) {
      return new this(name, await defaultValue());
    }
  }

  static with<T>(name: string, defaultValue: T) {
    const storedValue = localStorage.getItem(name);

    try {
      if (storedValue !== null) {
        return new this(name, JSON.parse(storedValue));
      }
      return new this(name, defaultValue);
    } catch(_) {
      return new this(name, defaultValue);
    }
  }

  constructor(name: string, storedValue: T) {
    this.#name = name;

    if (storedValue !== null) {
      this.set(storedValue);
    }
  }

  get() {
    return this.#value;
  }

  set(value: T) {
    this.#value = value;
    this.save();

    for (const handler of this.#handlers) {
      handler(value);
    }
  }

  subscribe(handler: EventHandler<T | null>) {
    this.#handlers.push(handler);
    handler(this.#value);
  }

  update(func: (value: T | null) => T){
    this.set(func(this.#value));
  }

  save() {
    localStorage.setItem(this.#name, JSON.stringify(this.#value));
  }
}

const assets = (async () => {
  const responses = await Promise.all(["example.c", "example.asm"].map((filename) => fetch(`../assets/${filename}`)));
  const [c, asm] = await Promise.all(responses.map((response) => response.text()));
  return { "example.c": c, "example.asm": asm };
})();

export const version = Field.with("version", 1);
export const syntax = Field.with("syntax", "icmc");
export const screenWidth = Field.with("screenWidth", 40);
export const screenHeight = Field.with("screenHeight", 30);
export const frequency = Field.with("frequency", 6);
export const files = await Field.async_with("files", async () => await assets);
export const entryFile = Field.with("entryFile", "example.asm");

localStorage.clear();

version.save();
syntax.save();
screenWidth.save();
screenHeight.save();
frequency.save();
files.save();
entryFile.save();