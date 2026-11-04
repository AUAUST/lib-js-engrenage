import type { StructureEnvironment } from "#structure/types/StructureEnvironment";
import type { TestVariant } from "#structure/types/TestVariant";
import type { Directory } from "#types/Directory";

export type ImportRuleSource =
  | { readonly kind: "environment"; readonly environment: StructureEnvironment }
  | { readonly kind: "element"; readonly path: Directory }
  | { readonly kind: "test-variant"; readonly variant: TestVariant };
