import type { ConfigResolver } from "#project/config/index";
import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

/**
 * Tag declarations, or a function of the config resolving them when they depend
 * on other config values.
 */
export type TagSet =
  | readonly TagDeclaration[]
  | ((config: ConfigResolver) => Promise<readonly TagDeclaration[]>);
