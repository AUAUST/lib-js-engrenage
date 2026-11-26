import type { InferOutput } from "valibot";

import type { namespaceImportsSchema } from "#batiment/scopes/config/schemas/namespaceImportsSchema";

/**
 * The `imports` a `.namespace.json` sets, by target namespace name: a relation, or
 * a relation with the target's only directories it reaches, relative to the scope.
 */
export type NamespaceImportsInput = InferOutput<typeof namespaceImportsSchema>;
