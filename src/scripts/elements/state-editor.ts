const SUFFIXES = ["Hz", "kHz", "MHz"];

interface ChangeFileEvent {
  detail: string;
}

interface ChangeFrequencyEvent {
  detail: number;
}

interface StateEditorElements {
  buttons: {
    stop: HTMLButtonElement;
    play: HTMLButtonElement;
    next: HTMLButtonElement;
    reset: HTMLButtonElement;
    frequency: HTMLInputElement;
  };
  registers: HTMLInputElement[];
  internalRegisters: HTMLInputElement[];
}

const TEMPLATE = document.getElementById(
  "stateViewTemplate",
) as HTMLTemplateElement;

export default class StateEditorElement extends HTMLElement {
  registers: Uint16Array = new Uint16Array(8);
  internalRegisters: Uint16Array = new Uint16Array(64);
  #elements: StateEditorElements;
  #fragment = TEMPLATE.content.cloneNode(true) as DocumentFragment;
  #numbersFormat: number = 16;

  constructor() {
    super();

    const fragment = this.#fragment;
    const forms = fragment.querySelectorAll("form");

    this.#elements = {
      buttons: forms[0].elements as unknown as StateEditorElements["buttons"],
      registers: forms[1]
        .elements as unknown as StateEditorElements["registers"],
      internalRegisters: forms[2]
        .elements as unknown as StateEditorElements["internalRegisters"],
    };

    this.#elements.buttons.frequency.addEventListener("input", ({ target }) => {
      this.dispatchEvent(
        new CustomEvent("changeFrequency", {
          detail: (target! as HTMLInputElement).valueAsNumber,
        }),
      );
    });

    this.#elements.buttons.play.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("play", {}));
    });

    this.#elements.buttons.stop.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("stop", {}));
    });

    this.#elements.buttons.next.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("next", {}));
    });

    this.#elements.buttons.reset.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("reset", {}));
    });
  }

  connectedCallback() {
    this.appendChild(this.#fragment);
  }

  render() {
    {
      const elements = this.#elements.registers;

      for (let i = 0, registers = this.registers; i < elements.length; i++) {
        elements[i].value = registers[i]
          .toString(this.#numbersFormat)
          .padStart(4, "0")
          .toUpperCase();
      }
    }

    {
      const elements = this.#elements.internalRegisters;

      for (
        let i = 0, registers = this.internalRegisters;
        i < elements.length;
        i++
      ) {
        elements[i].value = registers[i]
          .toString(this.#numbersFormat)
          .padStart(4, "0")
          .toUpperCase();
      }
    }
  }

  setFrequency(value: number) {
    if (!this.#elements.buttons) return;

    const frequency = this.#elements.buttons.frequency.valueAsNumber;

    const suffix = SUFFIXES[Math.floor(frequency / 3)];
    const frequencyText = `${(
      (10 ** frequency / 10 ** Math.floor(frequency)) *
      10 ** Math.floor(frequency % 3)
    ).toFixed(1)} ${suffix}`;

    (
      this.#elements.buttons.frequency.nextSibling! as HTMLInputElement
    ).innerText = frequencyText;

    if (this.#elements.buttons.frequency.valueAsNumber !== value) {
      this.#elements.buttons.frequency.value = value.toString();
    }
  }

  setNumbersFormat(format: number) {
    this.#numbersFormat = format;
  }

  setRunning(value: boolean) {
    // this.#running = value;

    this.#elements.buttons.stop.style.display = value ? "" : "none";
    this.#elements.buttons.play.style.display = value ? "none" : "";
  }
}

customElements.define("state-editor", StateEditorElement);

declare global {
  interface HTMLElementTagNameMap {
    "state-editor": StateEditorElement;
  }

  interface HTMLElementEventMap {
    changeFrequency: ChangeFrequencyEvent;
    changeFile: ChangeFileEvent;
    build: { detail: void };
    next: { detail: void };
    play: { detail: void };
    stop: { detail: void };
    reset: { detail: void };
  }
}
