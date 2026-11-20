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
  /**
   * Whether the code of the kind's environments ships with the package
   * (`published`) or stays in the repository (`private`); without one, it
   * counts as neither.
   */
  readonly code?: "published" | "private";
}

declare global {
  namespace Engrenage {
    interface Slots {
      environmentKinds: EnvironmentKindEntry;
    }
  }
}
