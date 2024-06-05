let callback = () => {};
const wrapper = (name) => function() { return callback(name, ...arguments); };

export const write = wrapper("write");
export const read = wrapper("read");
export const halt = wrapper("halt");
export const breakpoint = wrapper("breakpoint");
export const store = wrapper("store");

export function log(msg) {
  console.info(msg);
}

export function setCallback(cb) {
  callback = cb;
}
