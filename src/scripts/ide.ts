type Callback = (name: string, ...args: number[]) => void;
let callback: Callback = () => {};
const wrapper = (name: string) => function(...args: number[]) { return callback(name, ...args); };

export const store = wrapper("store");

export function log(msg: string) {
  console.info(msg);
}

export function setCallback(cb: Callback) {
  callback = cb;
}
