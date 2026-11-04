import type { Declaration } from "#options/types/Declaration";

export type DeclarationEntries = Readonly<
  Record<string, Declaration<unknown, unknown, never>>
>;
