type EventHandler<T> = (value: T) => void;
type FileManagerFile = string;

interface EventMap {
  _: void;
}
interface ConfigMap {
  _: void;
}
interface Config {
  name: keyof ConfigMap;
  value: ConfigMap[keyof ConfigMap];
}
