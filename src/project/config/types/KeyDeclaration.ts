import type { MaybePromise } from "@auaust/toolkit/types";

import type { Section } from "#foundation/options/index";

export interface KeyDeclaration<Output = unknown> {
  readonly input?: string;
  load(): MaybePromise<Section<Output>>;
}
