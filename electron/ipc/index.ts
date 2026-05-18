import { registerActivityHandlers } from "./activities";
import { registerAuthHandlers } from "./auth";
import { registerConfigHandlers } from "./config";
import { registerFrappeHandlers } from "./frappe";
import { registerSettingsHandlers } from "./settings";
import { registerTaskHandlers } from "./tasks";
import { registerTrackerHandlers } from "./tracker";

type IpcRegistrationOptions = {
  dirname: string;
  isDev: boolean;
  viteDevServerUrl?: string;
};

export function registerIpcHandlers(options: IpcRegistrationOptions) {
  registerActivityHandlers();
  registerAuthHandlers();
  registerConfigHandlers(options);
  registerFrappeHandlers();
  registerSettingsHandlers();
  registerTaskHandlers();
  registerTrackerHandlers();
}
