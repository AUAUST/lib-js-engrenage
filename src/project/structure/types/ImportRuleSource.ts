import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { TestVariant } from "#project/structure/types/TestVariant";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

export type ImportRuleSource =
  | {
      readonly kind: "environment";
      readonly environment: StructureEnvironmentName;
    }
  | { readonly kind: "element"; readonly path: Directory }
  | { readonly kind: "file"; readonly path: Glob }
  | { readonly kind: "test-variant"; readonly variant: TestVariant };
