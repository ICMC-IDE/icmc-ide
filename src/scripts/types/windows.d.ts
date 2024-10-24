import { GlobalState } from "../state/global.js";

export interface WindowConstructor {
  globalState: GlobalState;
  size: { width: number; height: number };
  position: { x: number; y: number };
  name?: string;
}
