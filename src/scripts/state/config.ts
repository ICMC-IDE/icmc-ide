const CONFIG_STORAGE_PREFIX = "config:";

export default class ConfigManager {
  #configs: Partial<
    Record<
      keyof ConfigMap,
      {
        value: ConfigMap[keyof ConfigMap] | undefined;
        handlers: EventHandler<ConfigMap[keyof ConfigMap] | undefined>[];
      }
    >
  > = {};

  get<K extends keyof ConfigMap>(config: K) {
    return this.#configs[config]?.value as ConfigMap[K] | undefined;
  }

  set<K extends keyof ConfigMap>(config: K, value: ConfigMap[K] | undefined) {
    if (!this.#configs[config]) {
      this.#configs[config] = {
        value,
        handlers: [],
      };
    }

    this.#configs[config].value = value;
    // this.save(config);

    for (const handler of this.#configs[config].handlers) {
      handler(value);
    }
  }

  subscribe<K extends keyof ConfigMap>(
    config: K,
    handler: EventHandler<ConfigMap[K] | undefined>,
  ) {
    if (!this.#configs[config]) {
      this.#configs[config] = {
        value: undefined,
        handlers: [],
      };
    }

    this.#configs[config].handlers.push(
      handler as EventHandler<ConfigMap[keyof ConfigMap] | undefined>,
    );
    handler(this.#configs[config].value as ConfigMap[K] | undefined);
  }

  unsubscribe<K extends keyof ConfigMap>(
    config: K,
    handler: EventHandler<ConfigMap[K] | undefined>,
  ) {
    if (!this.#configs[config]) {
      return;
    }

    this.#configs[config].handlers = this.#configs[config].handlers.filter(
      (h) => h !== handler,
    );
  }

  save<K extends keyof ConfigMap>(config: K) {
    localStorage.setItem(
      CONFIG_STORAGE_PREFIX + (config as string),
      JSON.stringify(this.#configs[config]?.value),
    );
  }

  saveAll() {
    for (const config in this.#configs) {
      this.save(config as keyof ConfigMap);
    }
  }

  load<K extends keyof ConfigMap>(config: K) {
    const storedValue = localStorage.getItem(
      CONFIG_STORAGE_PREFIX + (config as string),
    );

    if (storedValue !== null) {
      this.set(config, JSON.parse(storedValue));
    }
  }

  loadAll() {
    const storedConfigs = Object.keys(localStorage).filter((k) =>
      k.startsWith(CONFIG_STORAGE_PREFIX),
    );

    for (const config of storedConfigs) {
      this.load(config as keyof ConfigMap);
    }
  }

  // add delete mothod to delete a config (from storage and/or memory)
}

/* 
export class ConfigField<T> {
  #handlers: EventHandler<T | null>[] = [];
  #value: T | null = null;
  #name: string;

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

  update(func: (value: T | null) => T) {
    this.set(func(this.#value));
  }

  save() {
    localStorage.setItem(this.#name, JSON.stringify(this.#value));
  }

  static async async_with<T>(name: string, defaultValue: () => Promise<T>) {
    const storedValue = localStorage.getItem(name);

    try {
      if (storedValue !== null) {
        return new this<T>(name, JSON.parse(storedValue));
      }
      return new this<T>(name, await defaultValue());
    } catch (_) {
      return new this<T>(name, await defaultValue());
    }
  }

  static with<T>(name: string, defaultValue: T) {
    const storedValue = localStorage.getItem(name);

    try {
      if (storedValue !== null) {
        return new this<T>(name, JSON.parse(storedValue));
      }
      return new this<T>(name, defaultValue);
    } catch (_) {
      return new this<T>(name, defaultValue);
    }
  }
}

/*
const assets = (async () => {
  const responses = await Promise.all(
    ["example.c", "example.asm"].map((filename) =>
      fetch(`../assets/${filename}`),
    ),
  );
  const [c, asm] = await Promise.all(
    responses.map((response) => response.text()),
  );
  return { "example.c": c, "example.asm": asm, "test.asm": asm };
})();
*

const version = ConfigField.with("version", 1);
const syntax = ConfigField.with("syntax", "icmc");
const screenWidth = ConfigField.with("screenWidth", 40);
const screenHeight = ConfigField.with("screenHeight", 30);
const frequency = ConfigField.with("frequency", 6);
const filesystem = ConfigField.with("fs", fs);
const entryFile = ConfigField.with("entryFile", "example.asm");

localStorage.clear();

version.save();
syntax.save();
screenWidth.save();
screenHeight.save();
frequency.save();
filesystem.save();
entryFile.save();

export default {
  version,
  syntax,
  screenWidth,
  screenHeight,
  frequency,
  filesystem,
  entryFile,
};
*/
