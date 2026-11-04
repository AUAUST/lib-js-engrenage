import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";

export function createContext(config: ProjectConfig): ConfigContext {
  return {
    get(section) {
      return config[section];
    },
  };
}
