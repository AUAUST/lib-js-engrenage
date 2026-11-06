import { freeze } from "@auaust/toolkit/object";

export const roleContractDefaults = freeze({
  nesting: 0,
  index: false,
  public: false,
  typeOnly: false,
  discovered: false,
  scoped: false,
} as const);
