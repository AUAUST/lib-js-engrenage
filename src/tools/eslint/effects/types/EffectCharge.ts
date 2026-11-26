import type { Rule } from "eslint";

export interface EffectCharge {
  node: Rule.Node;
  function: Rule.Node | undefined;
  binding: string;
  target: string;
  level: string | undefined;
}
