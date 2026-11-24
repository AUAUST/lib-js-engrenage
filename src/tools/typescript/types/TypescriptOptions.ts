import type { InferInput } from "valibot";

import type { typescriptOptionsSchema } from "#tools/typescript/config/schemas/typescriptOptionsSchema";

/**
 * The options an environment selects the TypeScript language with; `tsx` names
 * the JSX flavour its `.tsx` files take, none without it.
 */
export type TypescriptOptions = InferInput<typeof typescriptOptionsSchema>;
