import { GlobalState } from "../state/global.js";

export interface WindowConstructor {
  globalState: GlobalState;
  style?: Record<string, string>;
}
