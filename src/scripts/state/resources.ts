import EventManager from "./event.js";

export default class ResourceManager<
  ResourceMap,
> extends EventManager<ResourceMap> {
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
      (this.#resources[config] = func(this.#resources[config]!)),
    );
  }
}
