import { getOwn } from "@auaust/toolkit/object";

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
      description: "A module of a ranked role imports at runtime only bindings declared in roles of its effect level or purer, and external modules ranked likewise.",
      messages: {
        effects: "A module of {{role}} ({{level}}) imports `{{binding}}` from {{target}} ({{targetLevel}}); import only {{level}} or purer bindings, or move the code.",
      },
      create(context, { namespace, role, effects: roleLevel }) {
        const environmentRoles = namespace === undefined
          ? undefined
          : getOwn(roles, namespace);

        if (
          environmentRoles === undefined ||
          role === undefined ||
          roleLevel === undefined
        ) {
          return {};
        }

        const { effects } = environmentRoles;
        const { levels } = effects;
        const unitCeiling = roleLevel;

        function judge({ node, binding, target, level }: EffectCharge) {
          const ceiling = unitCeiling;

          if (
            level !== undefined &&
            levels.indexOf(level) <= levels.indexOf(ceiling)
          ) {
            return;
          }

          context.report({
            node,
            messageId: "effects",
            data: {
              role,
              level: ceiling,
              binding,
              target,
              targetLevel: level ?? "unranked",
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
