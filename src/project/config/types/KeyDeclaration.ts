import type { Lazy } from "#foundation/modules/index";
import type { Section } from "#foundation/options/index";

export interface KeyDeclaration<Output = unknown> extends Lazy<
  Section<Output>
> {
  readonly input?: string;
}
