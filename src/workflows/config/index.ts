// @debt a domain holding only the public `./config` entry (an identity `defineConfig`, a generated type, a re-exported `define`) beside `project/config` and `workflows/registry`: three `config` homes for one concern
export { define } from "#project/config/index";
// @barrel definers/*.ts named
export { defineConfig } from "#workflows/config/definers/defineConfig";
// @end
export type { Resolvable } from "#types/Resolvable";

// @barrel types/*.ts all
export * from "#workflows/config/types/ConfigInput";
// @end
