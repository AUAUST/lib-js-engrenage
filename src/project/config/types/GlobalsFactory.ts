import type { DefineContext } from "#project/config/types/DefineContext";

export type GlobalsFactory = (
  context: DefineContext,
) => Readonly<Record<string, unknown>>;
