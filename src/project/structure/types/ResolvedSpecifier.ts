import type { Alias } from "#project/structure/types/Alias";

export type ResolvedSpecifier =
  | {
      readonly kind: "relative" | "alias";
      readonly path: string;
      readonly alias?: Alias;
    }
  | { readonly kind: "self"; readonly subpath: string }
  | { readonly kind: "package"; readonly name: string };
