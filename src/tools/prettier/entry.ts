import { definePrettierConfig } from "#tools/prettier/index";

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
  ResolvedPrettier,
} from "#tools/prettier/index";
