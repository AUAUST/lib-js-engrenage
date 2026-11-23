import type { NamespaceKind } from "#batiment/scopes/index";
import type { EntryShape } from "#foundation/extensions/index";

export interface NamespaceKindEntry extends EntryShape, NamespaceKind {
  /**
   * Names the kind, which the top-level namespace of the same name takes.
   */
  readonly name: string;
}

declare global {
  namespace Engrenage {
    interface Slots {
      namespaceKinds: NamespaceKindEntry;
    }
  }
}
