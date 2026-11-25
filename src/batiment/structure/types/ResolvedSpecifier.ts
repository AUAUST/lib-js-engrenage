import type { Alias } from "#batiment/structure/types/Alias";
import type { Directory } from "#types/Directory";

export type ResolvedSpecifier =
  | {
      readonly kind: "relative" | "alias";
      readonly path: string;
      readonly alias?: Alias;
    }
  | { readonly kind: "self"; readonly subpath: string }
  | {
      readonly kind: "scope";
      readonly scope: Directory;
      readonly subpath: string;
      readonly exported: boolean;
    }
  | { readonly kind: "package"; readonly name: string };
