import ConfigManager from "state/config";
import EventManager from "state/event";

export default interface GlobalState {
  eventManager: EventManager;
  configManager: ConfigManager;
}
