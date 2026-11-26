import type { Plugin } from "#tools/eslint/index";

export interface RuleSource {
  name: string;
  prefix: string;
  plugin: Plugin;
}
