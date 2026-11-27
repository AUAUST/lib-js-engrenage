import { getOwn } from "@auaust/toolkit/object";

import { chargeEffect } from "#batiment/effects/index";
import {
  collectEffectCharges,
  type EffectCharge,
  type EffectDeclaration,
} from "#tools/eslint/effects/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  typeAware: true,
  sections: {
    entities: "entities",
    roles: "environmentRoles",
    docs: "docs",
    globals: "environments.globals",
    execution: "environments.execution",
    tool: "build.tool",
  },
  rule: ({ entities, roles, docs, globals, execution, tool }, { root }) => {
    return defineStructureRule({
      entities,
      description: "Code of a ranked role runs only what its ceilings allow where it runs: what loading a module does against its evaluation ceiling while the module evaluates, and what invoking a binding does against the ceiling of the position invoking it, inside a function the level its effect doc tag declares, else the invocation ceiling. An effect doc tag stays within the invocation ceiling, and invoking a tagged binding costs its tag. A global the environment ranks costs its rank once invoked, and its member's rank once read.",
      messages: {
        evaluate: "A module of {{role}} loads {{unit}} ({{level}} evaluation){{through}} during {{position}}, above {{bound}}; load only modules evaluating at {{ceiling}} or purer there, or move the import.",
        invoke: "A module of {{role}} invokes `{{binding}}` from {{unit}} ({{level}}){{through}} during {{position}}, above {{bound}}; invoke only {{ceiling}} or purer code there, or move the call.",
        read: "A module of {{role}} reads `{{binding}}` from {{unit}} ({{level}}){{through}} during {{position}}, above {{bound}}; read only {{ceiling}} or purer state there, or move the read.",
        declare: "A module of {{role}} tags a function or class {{level}}, above its invocation ceiling ({{ceiling}}); tag it {{ceiling}} or purer, or move it to a role allowing {{level}}.",
      },
      create(context, { namespace, role, effects: ceilings, environment }) {
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

        function exceeds(level: string | undefined, ceiling: string) {
          return (
            level === undefined ||
            levels.indexOf(level) > levels.indexOf(ceiling)
          );
        }

        function judge({
          node,
          operation,
          position,
          target,
          unit,
          binding,
          through,
          declared,
        }: EffectCharge) {
          const cost = chargeEffect({
            operation,
            target,
            position,
            ceilings: declared === undefined
              ? unitCeilings
              : { ...unitCeilings, invocation: declared },
          });

          if (cost === undefined || !exceeds(cost.level, cost.ceiling)) {
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
              bound: declared === undefined
                ? `its ${position} ceiling (${cost.ceiling})`
                : `the level its effect doc tag declares (${cost.ceiling})`,
            },
          });
        }

        function judgeDeclaration({ node, level }: EffectDeclaration) {
          const ceiling = unitCeilings.invocation;

          if (ceiling !== undefined && exceeds(level, ceiling)) {
            context.report({
              node,
              messageId: "declare",
              data: {
                role,
                level,
                ceiling,
              },
            });
          }
        }

        const host = environment === undefined
          ? undefined
          : getOwn(globals, environment);

        const bundled = (
          environment !== undefined &&
          getOwn(execution, environment)?.bundled === true
        );

        const replaced = bundled && tool !== false ? tool.globals : undefined;

        return collectEffectCharges({
          context,
          entities,
          effects,
          tags: docs.tags,
          globals: [
            ...(replaced === undefined ? [] : [replaced]),
            ...(host?.ranks ?? []),
          ],
          aliases: host?.aliases ?? [],
          root,
          charge: judge,
          declare: judgeDeclaration,
        });
      },
    });
  },
});
