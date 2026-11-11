import { picklist, tupleWithRest, union } from "valibot";

import { reexportModes } from "#project/roles/constants";

// @debt the list lacks a `readonly()` action because the JSON Schema codegen cannot convert it, so the schema output is a mutable list the types restate as readonly
export const reexportSchema = union([
  picklist(reexportModes),
  tupleWithRest([picklist(reexportModes)], picklist(reexportModes)),
]);
