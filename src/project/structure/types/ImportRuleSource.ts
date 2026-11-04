import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { TestVariant } from "#project/structure/types/TestVariant";
import type { Directory } from "#types/Directory";

export type ImportRuleSource =
  | {
      readonly kind: "environment";
      readonly environment: StructureEnvironmentName;
    }
  | { readonly kind: "element"; readonly path: Directory }
  | { readonly kind: "test-variant"; readonly variant: TestVariant };
