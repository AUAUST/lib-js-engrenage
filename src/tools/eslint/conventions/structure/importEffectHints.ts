import { freeze } from "@auaust/toolkit/object";

import { defineEffectConvention } from "#tools/eslint/operations/defineEffectConvention";
import type { EffectOperation } from "#batiment/effects/index";
import type { EffectCharge } from "#tools/eslint/effects/index";

const actions = freeze({
  evaluate: "loads",
  invoke: "invokes",
  read: "reads",
  write: "writes",
}) satisfies Readonly<Record<EffectOperation, string>>;

export default defineEffectConvention({
  severity: "info",
  description: "Hints at effects `auaust/import-effects` cannot prove: code a function or class created inside a tagged one runs above that tag, a callable binding passed or stored without being invoked whose invocation costs more than the ceiling of the code holding it, and a write to a value a call result or a reassignment hides, which would cost more than its ceiling if the state were outside its module.",
  messages: {
    escape: "A function or class created inside one tagged {{tag}} {{action}} `{{binding}}` from {{unit}} ({{level}}), above that tag, so its creator's callers may run it expecting {{tag}}; tag the created function {{level}} to state its level, or keep it within {{tag}}.",
    pass: "A module of {{role}} passes `{{binding}}` from {{unit}} without invoking it, and invoking it costs {{level}}, above {{bound}}; if what receives it invokes it, move this code to a role whose invocation ceiling allows {{level}}, else pass {{ceiling}} or purer code.",
    hidden: "A module of {{role}} writes `{{binding}}`, through {{unit}}, which a call result or a reassignment hides; changing state outside its module there costs {{level}}, above {{bound}}; write through the parameter, binding or `const` alias naming the state, or a fresh value, so its owner shows.",
  },
  create(context, { role, exceeding }) {
    function bound({ position, declared }: EffectCharge, ceiling: string) {
      return declared === undefined
        ? `its ${position} ceiling (${ceiling})`
        : `the level its effect doc tag declares (${ceiling})`;
    }

    function charge(found: EffectCharge) {
      const { hint, node, operation, unit, binding, through } = found;

      if (hint === undefined || through !== undefined) {
        return;
      }

      const judged: EffectCharge = hint === "pass"
        ? { ...found, position: "invocation" }
        : found;

      const cost = exceeding(judged);

      if (
        cost === undefined ||
        (hint === "escape" &&
          exceeding({ ...found, declared: undefined }) !== undefined)
      ) {
        return;
      }

      context.report({
        node,
        messageId: hint,
        data: {
          role,
          tag: cost.ceiling,
          action: actions[operation],
          binding,
          unit,
          level: cost.level ?? "unranked",
          ceiling: cost.ceiling,
          bound: bound(judged, cost.ceiling),
        },
      });
    }

    return { charge };
  },
});
