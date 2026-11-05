import type { OptionContext } from "#foundation/options/index";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";

export interface ConfigContext extends OptionContext<ProjectConfig> {}
