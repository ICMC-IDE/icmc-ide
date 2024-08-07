import EventManager from "../state/event.js";
import TheWorker from "../workers/main.js?worker";

interface MainWorkerEventMap extends WorkerEventMap {
  stop: void;
  play: void;
  build: void;
  ready: void;
  response: {
    id: number;
    content: any;
    error: string | null;
  };
}

type MainWorkerMessage = {
  [T in keyof MainWorkerEventMap]: {
    type: T;
    content: MainWorkerEventMap[T];
  };
};

interface MainWorkerMessageMap {
  reset: void;
  play: void;
  stop: void;
  build: void;
  frequency: number;
}

export default class MainWorker extends EventManager<MainWorkerEventMap> {
  #worker = new TheWorker();
  #requests = new Map();
  #id = 0;

  isReady: Promise<void>;

  constructor() {
    super();
    const worker = this.#worker;

    // @ts-ignore
    const { promise, resolve } = Promise.withResolvers();
    this.isReady = promise;

    worker.addEventListener(
      "message",
      ({
        data: { type, content },
      }: MessageEvent<MainWorkerMessage[keyof MainWorkerEventMap]>) => {
        switch (type) {
          case "response": {
            console.log("[RESPONSE]", content);

            const { resolve, reject } = this.#requests.get(content.id)!;

            if (content.error == null) {
              resolve(content.content);
            } else {
              reject(content.error);
            }

            this.#requests.delete(content.id);
            break;
          }
          case "ready": {
            resolve();
            break;
          }
          default:
            this.emmit(type, content);
        }
      },
    );

    worker.addEventListener("messageerror", (event) => {
      this.emmit("messageerror", event);
    });

    worker.addEventListener("error", (event) => {
      this.emmit("error", event);
    });
  }

  request(type: string, content: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.#id++;

      this.#requests.set(id, { resolve, reject });

      console.log("[REQUEST]", { type, id, content });

      this.#worker.postMessage({
        type,
        id,
        content,
      });
    });
  }
}
