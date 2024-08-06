import { EventHandler, EventUnsubscriber } from "types";

class EventSubscriber<EventMap, T extends EventManager<EventMap>> {
  #eventManager: T;
  #unsubscribers: EventUnsubscriber[] = [];

  constructor(eventManager: T) {
    this.#eventManager = eventManager;
  }

  subscribe<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ) {
    this.#unsubscribers.push(this.#eventManager.subscribe(event, handler));
  }

  unsubscribeAll() {
    for (const unsubscribe of this.#unsubscribers) {
      unsubscribe();
    }
  }
}

export default class EventManager<EventMap> {
  #events: Partial<
    Record<keyof EventMap, EventHandler<EventMap[keyof EventMap]>[]>
  > = {};

  subscribe<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>,
  ): EventUnsubscriber {
    if (!this.#events[event]) {
      this.#events[event] = [];
    }

    this.#events[event].push(handler as EventHandler<EventMap[keyof EventMap]>);
    return () => this.unsubscribe(event, handler);
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

  getSubscriber() {
    return new EventSubscriber<EventMap, this>(this);
  }

  // add method to delete an event
}
