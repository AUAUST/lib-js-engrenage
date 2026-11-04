import type { StructureEnvironmentName } from "#structure/types/StructureEnvironmentName";
import type { TestVariant } from "#structure/types/TestVariant";
import type { Directory } from "#types/Directory";

export type ImportRuleSource =
  | {
      readonly kind: "environment";
      readonly environment: StructureEnvironmentName;
    }
  | { readonly kind: "element"; readonly path: Directory }
  | { readonly kind: "test-variant"; readonly variant: TestVariant };
