import type { ConfigSections } from "#project/config/types/ConfigSections";

export type ConfigKey = Extract<keyof ConfigSections, string>;
