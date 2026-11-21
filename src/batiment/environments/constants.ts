import { array, optional, picklist, record, string } from "valibot";

import { freeze } from "@auaust/toolkit/object";

// @debt valibot's schema types hold mutable arrays in their type-only `~types` and `~standard.types` members, so the read-only check is disabled instead of passing on the schema types
// eslint-disable-next-line auaust/readonly-constants -- the only mutable members are type-only, absent at runtime
export const environmentKindFields = freeze({
  name: string(),
  level: picklist(["foreign", "described", "enforced"] as const),
  structure: optional(picklist(["domains", "roles"] as const)),
  imports: optional(record(string(), picklist(["whole", "surface"] as const))),
  inward: optional(picklist(["open", "surface", "sealed"] as const)),
  layout: optional(string()),
  languages: optional(array(string())),
});

export const environmentMetadataFile = ".environment.json";

export const namespaceMetadataFile = ".namespace.json";

export const domainMetadataFile = ".domain.json";
