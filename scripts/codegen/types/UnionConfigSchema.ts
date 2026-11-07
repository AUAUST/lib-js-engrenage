import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";

export interface UnionConfigSchema {
  type: "union";
  options: readonly ConfigSchema[];
}
