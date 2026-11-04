import type { ImportCategory } from "#project/structure/types/ImportCategory";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

export type ImportRuleTarget =
  | { readonly kind: "element"; readonly path: Directory }
  | { readonly kind: "index"; readonly path: Directory }
  | { readonly kind: "modules"; readonly path: Directory }
  | { readonly kind: "file"; readonly path: Glob }
  | { readonly kind: "category"; readonly category: ImportCategory };
