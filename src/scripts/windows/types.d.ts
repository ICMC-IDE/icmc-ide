import { ConfigField } from "../config";
import { EventEmitter } from "../events";

export interface WindowProps {
  style: Record<string, string>;
  config: Record<string, ConfigField<T>>;
  events: Record<string, EventEmitter<T>>;
}
