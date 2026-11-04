import type { DefineContext } from "#config/types/DefineContext";

export type GlobalsFactory = (
  context: DefineContext,
) => Readonly<Record<string, unknown>>;
