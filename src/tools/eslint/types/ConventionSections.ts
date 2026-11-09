import type { ConfigKey } from "#project/config/index";

// @debt conventions name their config keys `sections`, a name left from section reads
export type ConventionSections = Readonly<Record<string, ConfigKey>>;
