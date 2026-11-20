import type { ValueOrigin } from "#foundation/options/index";

/**
 * The config option a structure value comes from: the environment's options
 * `key`, the dotted option `path` under its input name, and the layer that
 * set it, when read.
 *
 * @experimental
 */
export interface OptionSource {
  readonly key: string;
  readonly path: string;
  readonly origin?: ValueOrigin;
}
