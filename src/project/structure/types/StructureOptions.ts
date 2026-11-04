import type { Directory } from "#types/Directory";

export interface StructureOptions<Reference = string> {
  readonly namespaces: Readonly<
    Record<
      Directory,
      {
        readonly layers: readonly string[] | undefined;
        readonly roles: { readonly enable: readonly Reference[] };
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
