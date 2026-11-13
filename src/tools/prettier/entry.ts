import { definePrettierConfig } from "#tools/prettier/index";

/**
 * The project's Prettier config with engrenage's defaults, for a config file
 * that needs no options.
 */
export default definePrettierConfig();

export { definePrettierConfig } from "#tools/prettier/index";
export {
  createPrettierConfig,
  formatWithPrettier,
  syncPrettierignoreFile,
} from "#tools/prettier/index";
export type {
  Config,
  Options,
  Plugin,
  PrettierInput,
  PrettierPlugin,
  ResolvedPrettier,
} from "#tools/prettier/index";
