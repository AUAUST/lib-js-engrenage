import type { RoleKey } from "#project/structure/types/RoleKey";
import type { Directory } from "#types/Directory";

export interface StructureOptions {
  readonly namespaces: Readonly<
    Record<
      Directory,
      {
        readonly layers: readonly string[] | undefined;
        readonly roles: { readonly enable: readonly RoleKey[] };
      }
    >
  >;
  readonly domains: Readonly<
    Record<
      string,
      {
        readonly public: boolean | undefined;
        readonly specifier: string | undefined;
        readonly purpose: string | undefined;
      }
    >
  >;
  readonly optOut: readonly Directory[];
  readonly strictness: "strict" | "loose";
}
