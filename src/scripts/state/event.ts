export default class EventManager {
  #events: Partial<
    Record<keyof EventMap, EventHandler<EventMap[keyof EventMap]>[]>
  > = {};

  subscribe<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ) {
    if (!this.#events[event]) {
      this.#events[event] = [];
    }

    this.#events[event].push(handler as EventHandler<EventMap[keyof EventMap]>);
  }

  unsubscribe<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ) {
    if (!this.#events[event]) {
      return;
    }

    this.#events[event] = this.#events[event].filter((h) => h !== handler);
  }

  emmit<K extends keyof EventMap>(event: K, value: EventMap[K]) {
    if (!this.#events[event]) {
      return;
    }

    for (const handler of this.#events[event]) {
      handler(value);
    }
  }

  // add delete mothod to delete an event
}

/*
export {
  deleteFile: new EventEmitter<File>(),
  openFile: new EventEmitter<File>(),
  refresh: new EventEmitter<void>(),
  render: new EventEmitter<void>(),
  setCharmap: new EventEmitter<Charmap>(),
};
*/
