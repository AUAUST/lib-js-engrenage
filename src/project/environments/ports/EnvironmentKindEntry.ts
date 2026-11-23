import type { EnvironmentKind } from "#batiment/environments/index";
import type { EntryShape } from "#foundation/extensions/index";

export interface EnvironmentKindEntry extends EntryShape, EnvironmentKind {
  /**
   * Names the kind, which each environment of this kind names as its `kind`.
   */
  readonly name: string;
  /**
   * Whether the kind's environments have a TypeScript project configuration,
   * read from the `tsconfig` option their options key must resolve.
   */
  readonly tsconfig?: boolean;
}

declare global {
  namespace Engrenage {
    interface Slots {
      environmentKinds: EnvironmentKindEntry;
    }
  }
}
