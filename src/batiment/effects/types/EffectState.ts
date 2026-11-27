/**
 * Who owns the state an operation reads or writes: the running function (`own`),
 * its caller (`received`), an enclosing function (`closure`), its unit alone
 * (`unit-private`), its unit and the units importing it (`unit-shared`), or
 * anything else (`external`).
 */
export type EffectState =
  | "own"
  | "received"
  | "closure"
  | "unit-private"
  | "unit-shared"
  | "external";
