import EventManager from "./event.js";

export default class ResourceManager<
  ResourceMap,
> extends EventManager<ResourceMap> {
  #resourceManager: Partial<ResourceMap> = {};

  get<K extends keyof ResourceMap>(config: K) {
    return this.#resourceManager[config] as ResourceMap[K];
  }

  getMany<K extends keyof ResourceMap>(...args: K[]) {
    // return args.map((key) => this.#resourceManager[key]);
    return args.reduce(
      (acc, key) => {
        acc[key] = this.#resourceManager[key]!;
        return acc;
      },
      {} as Pick<ResourceMap, K>,
    );
  }

  set<K extends keyof ResourceMap>(config: K, value: ResourceMap[K]) {
    this.emmit(config, (this.#resourceManager[config] = value));
  }

  update<K extends keyof ResourceMap>(
    config: K,
    func: (current: ResourceMap[K]) => ResourceMap[K],
  ) {
    this.emmit(
      config,
      (this.#resourceManager[config] = func(this.#resourceManager[config]!)),
    );
  }
}
