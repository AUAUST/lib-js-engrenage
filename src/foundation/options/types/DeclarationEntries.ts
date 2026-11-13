import type { Declaration } from "#foundation/options/ports/Declaration";

export type DeclarationEntries = Readonly<
  Record<string, Declaration<unknown, unknown, never>>
>;
