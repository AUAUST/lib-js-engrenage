import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";

export interface ObjectConfigSchema {
  type: "strict_object" | "loose_object";
  entries: Readonly<Record<string, ConfigSchema>>;
}
