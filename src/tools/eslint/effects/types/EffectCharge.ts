import type {
  EffectOperation,
  EffectPosition,
  EffectTarget,
} from "#batiment/effects/index";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * An operation on `target`, the unit `unit` names, run in `position`, by a
 * side-effect import when `sideEffect`, loading its target for its effect
 * alone; at evaluation, `through` names the local function whose call runs it;
 * at invocation, `declared` is the level the effect doc tag of the function
 * running it declares.
 */
export interface EffectCharge {
  node: SyntaxNode;
  operation: EffectOperation;
  position: EffectPosition;
  target: EffectTarget;
  unit: string;
  binding: string;
  sideEffect: boolean;
  through: string | undefined;
  declared: string | undefined;
}
