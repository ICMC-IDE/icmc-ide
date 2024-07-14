import GlobalState from "state";

export interface WindowConstructor {
  globalState: GlobalState;
  style: Record<string, string>;
}
