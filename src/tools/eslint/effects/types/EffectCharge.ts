import type {
  EffectOperation,
  EffectPosition,
  EffectTarget,
} from "#batiment/effects/index";
import type { SyntaxNode } from "#tools/eslint/effects/types/SyntaxNode";

/**
 * An operation on `target`, the unit `unit` names, run in `position`; at
 * evaluation, `through` names the local function whose call runs it.
 */
export interface EffectCharge {
  node: SyntaxNode;
  operation: EffectOperation;
  position: EffectPosition;
  target: EffectTarget;
  unit: string;
  binding: string;
  through: string | undefined;
}
