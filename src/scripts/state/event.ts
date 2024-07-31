export type EventHandler<T> = (value: T) => void;

export default class EventManager<EventMap> {
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
    const events = this.#events[event];

    if (!events) {
      return;
    }

    queueMicrotask(() => {
      for (const handler of events) {
        handler(value);
      }
    });
  }

  // add method to delete an event
}
