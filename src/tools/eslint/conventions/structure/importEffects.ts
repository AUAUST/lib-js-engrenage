import { getOwn } from "@auaust/toolkit/object";

import { chargeEffect } from "#batiment/effects/index";
import {
  collectEffectCharges,
  type EffectCharge,
} from "#tools/eslint/effects/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  typeAware: true,
  sections: { entities: "entities", roles: "environmentRoles" },
  rule: ({ entities, roles }, { root }) => {
    return defineStructureRule({
      entities,
      description: "Code of a ranked role runs only what its ceilings allow where it runs: what loading a module does against its evaluation ceiling while the module evaluates, and what invoking a binding does against the ceiling of the position invoking it, inside functions its invocation ceiling.",
      messages: {
        evaluate: "A module of {{role}} loads {{unit}} ({{level}} evaluation){{through}} during {{position}}, above its {{position}} ceiling ({{ceiling}}); load only modules evaluating at {{ceiling}} or purer there, or move the import.",
        invoke: "A module of {{role}} invokes `{{binding}}` from {{unit}} ({{level}}){{through}} during {{position}}, above its {{position}} ceiling ({{ceiling}}); invoke only {{ceiling}} or purer code there, or move the call.",
      },
      create(context, { namespace, role, effects: ceilings }) {
        const environmentRoles = namespace === undefined
          ? undefined
          : getOwn(roles, namespace);

        if (
          environmentRoles === undefined ||
          role === undefined ||
          ceilings === undefined
        ) {
          return {};
        }

        const { effects } = environmentRoles;
        const { levels } = effects;
        const unitCeilings = ceilings;

        function judge({
          node,
          operation,
          position,
          target,
          unit,
          binding,
          through,
        }: EffectCharge) {
          const cost = chargeEffect({
            operation,
            target,
            position,
            ceilings: unitCeilings,
          });

          if (
            cost === undefined ||
            (cost.level !== undefined &&
              levels.indexOf(cost.level) <= levels.indexOf(cost.ceiling))
          ) {
            return;
          }

          context.report({
            node,
            messageId: operation,
            data: {
              role,
              position,
              ceiling: cost.ceiling,
              binding,
              unit,
              level: cost.level ?? "unranked",
              through: through === undefined ? "" : ` through \`${through}\``,
            },
          });
        }

        return collectEffectCharges({
          context,
          entities,
          effects,
          root,
          charge: judge,
        });
      },
    });
  },
});
