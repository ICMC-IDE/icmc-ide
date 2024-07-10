const FREQUENCIES = [
  "1 Hz",
  "10 Hz",
  "100 Hz",
  "1 kHz",
  "10 kHz",
  "100 kHz",
  "1 MHz",
  "10 MHz",
  "100 MHz",
  "FAST!",
];

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
    file: HTMLSelectElement;
    frequency: HTMLInputElement;
  };
  registers: HTMLInputElement[];
  internalRegisters: HTMLInputElement[];
}

export default class StateEditorElement extends HTMLElement {
  #elements: StateEditorElements | null = null;
  // #running = false;
  #frequency = 6;

  registers: Uint16Array | null = null;
  internalRegisters: Uint16Array | null = null;

  constructor() {
    super();
  }

  connectedCallback() {
    const stateViewTemplate = document.getElementById(
      "stateViewTemplate",
    ) as HTMLTemplateElement;
    this.appendChild(stateViewTemplate.content.cloneNode(true));

    const forms = this.querySelectorAll("form");

    this.#elements = {
      buttons: forms[0].elements as unknown as StateEditorElements["buttons"],
      registers: forms[1]
        .elements as unknown as StateEditorElements["registers"],
      internalRegisters: forms[2]
        .elements as unknown as StateEditorElements["internalRegisters"],
    };

    this.#elements!.buttons.frequency.addEventListener(
      "input",
      ({ target }) => {
        this.dispatchEvent(
          new CustomEvent("change-frequency", {
            detail: (target! as HTMLInputElement).valueAsNumber,
          }),
        );
      },
    );

    this.#elements!.buttons.file.addEventListener("input", ({ target }) => {
      this.dispatchEvent(
        new CustomEvent("change-file", {
          detail: (target! as HTMLSelectElement).value,
        }),
      );
    });
  }

  render() {
    const elements = this.#elements;

    if (this.registers) {
      for (let i = 0, registers = this.registers; i < registers.length; i++) {
        elements!.registers[i].value = registers[i]
          .toString(16)
          .padStart(4, "0")
          .toUpperCase();
      }
    }

    if (this.internalRegisters) {
      for (let i = 0, registers = this.internalRegisters; i < 4; i++) {
        elements!.internalRegisters[i].value = registers[i]
          .toString(16)
          .padStart(4, "0")
          .toUpperCase();
      }
    }
  }

  get frequency() {
    return 10 ** this.#frequency;
  }

  set frequency(value) {
    this.#frequency = value;

    if (!this.#elements!.buttons) return;

    (
      this.#elements!.buttons.frequency.nextSibling! as HTMLInputElement
    ).innerText = FREQUENCIES[this.#elements!.buttons.frequency.valueAsNumber];

    if (this.#elements!.buttons.frequency.valueAsNumber !== value) {
      this.#elements!.buttons.frequency.value = value.toString();
    }
  }

  set running(value: boolean) {
    // this.#running = value;

    this.#elements!.buttons.stop.style.display = value ? "" : "none";
    this.#elements!.buttons.play.style.display = value ? "none" : "";
  }

  set files(fileNames: string[]) {
    const select = this.#elements!.buttons.file;
    const value = select.value;

    while (select.lastElementChild) {
      select.lastElementChild.remove();
    }

    for (const fileName of fileNames) {
      if (!fileName.match(/\.c$|\.asm/i)) continue;

      const option = document.createElement("option");
      option.value = fileName;
      option.innerText = fileName;
      option.selected = fileName === value;
      select.appendChild(option);
    }
  }

  set entryFile(fileName: string) {
    this.#elements!.buttons.file.value = fileName;
  }
}

customElements.define("state-editor", StateEditorElement);

declare global {
  interface HTMLElementTagNameMap {
    "state-editor": StateEditorElement;
  }
  interface HTMLElementEventMap {
    "change-frequency": ChangeFrequencyEvent;
    "change-file": ChangeFileEvent;
  }
}
