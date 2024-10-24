import EventManager from "./event.js";

export default class ConfigManager<ConfigMap> extends EventManager<ConfigMap> {
  #configs: Partial<ConfigMap>;
  #prefix: string;

  constructor(prefix: string, defaults?: Partial<ConfigMap>) {
    super();

    this.#prefix = prefix + ":";
    this.#configs = defaults ?? ({} as ConfigMap);
  }

  get<K extends keyof ConfigMap>(config: K) {
    return this.#configs[config] as ConfigMap[K];
  }

  getMany<K extends keyof ConfigMap>(...args: K[]) {
    return args.map((key) => this.#configs[key]);
  }

  set<K extends keyof ConfigMap>(config: K, value: ConfigMap[K]) {
    this.#configs[config] = value;
    this.save(config);

    this.emmit(config, value);
  }

  save<K extends keyof ConfigMap>(config: K) {
    localStorage.setItem(
      this.#prefix + (config as string),
      JSON.stringify(this.#configs[config]),
    );
  }

  saveAll() {
    for (const config in this.#configs) {
      this.save(config as keyof ConfigMap);
    }
  }

  load<K extends keyof ConfigMap>(config: K) {
    const storedValue = localStorage.getItem(this.#prefix + (config as string));

    if (storedValue !== null) {
      this.set(config, JSON.parse(storedValue));
    }
  }

  loadAll() {
    const storedConfigs = Object.keys(localStorage)
      .filter((k) => k.startsWith(this.#prefix))
      .map((k) => k.slice(this.#prefix.length));

    for (const config of storedConfigs) {
      this.load(config as keyof ConfigMap);
    }
  }

  // add delete method to delete a config (from storage and/or memory)
}
