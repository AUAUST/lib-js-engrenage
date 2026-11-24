import type { Lazy } from "#foundation/modules/index";
import type { Section } from "#foundation/options/index";
import type { KeyScope } from "#project/config/types/KeyScope";

export interface KeyDeclaration<Output = unknown> extends Lazy<
  Section<Output>
> {
  readonly input?: string;
  /**
   * Where the key resolves, `scoped` by default: `project` keys resolve once,
   * through the root, in every scope; `scoped` keys in each scope from its own
   * layers; `inherited` keys too, over the root's merged input.
   */
  readonly scope?: KeyScope;
}
