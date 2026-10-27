import type { DefineContext } from "#config/types/DefineContext";
import type { Globals } from "#config/types/Globals";

export type GlobalsFactory = (context: DefineContext) => Globals;
