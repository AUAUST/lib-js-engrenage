import type { Declaration } from "#foundation/options/types/Declaration";

export type DeclarationEntries = Readonly<
  Record<string, Declaration<unknown, unknown, never>>
>;
