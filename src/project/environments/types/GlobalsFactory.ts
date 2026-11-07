import type { DefineContext } from "#project/environments/types/DefineContext";

export type GlobalsFactory = (
  context: DefineContext,
) => Readonly<Record<string, unknown>>;
