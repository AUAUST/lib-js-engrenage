// @debt a domain holding only the public `./config` entry (an identity `defineConfig`, a generated type, a re-exported `define`) beside `project/config` and `workflows/registry`: three `config` homes for one concern
export { define } from "#project/config/index";
// @barrel config/define*Config.ts named
export { defineConfig } from "#workflows/config/config/defineConfig";
// @end
export type { Resolvable } from "#types/Resolvable";

// @barrel types/*.ts all
export * from "#workflows/config/types/ConfigInput";
// @end
