import { registerActivityHandlers } from "./activities";
import { registerAuthHandlers } from "./auth";
import { registerFrappeHandlers } from "./frappe";
import { registerSettingsHandlers } from "./settings";
import { registerTaskHandlers } from "./tasks";
import { registerTrackerHandlers } from "./tracker";

export function registerIpcHandlers() {
  registerActivityHandlers();
  registerAuthHandlers();
  registerFrappeHandlers();
  registerSettingsHandlers();
  registerTaskHandlers();
  registerTrackerHandlers();
}
