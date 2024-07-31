import ConfigManager from "./config.js";
import EventManager from "./event.js";
import ResourceManager, { loadResources } from "./resources.js";

export interface GlobalState {
  eventManager: EventManager<EventMap>;
  configManager: ConfigManager;
  resources: ResourceManager;
}

type FileManagerFile = string;

interface EventMap {
  "delete-file": FileManagerFile;
  "open-file": FileManagerFile;
  "open-window": string;
  error: Error;
  render: void;
}

const eventManager = new EventManager<EventMap>();
const configManager = new ConfigManager();
const resources = await loadResources();

configManager.loadAll();

export default <GlobalState>{
  eventManager,
  configManager,
  resources,
};
