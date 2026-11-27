import type { Rule } from "eslint";

import { getOwn } from "@auaust/toolkit/object";

import {
  chargeEffect,
  type EffectCeilings,
  type EffectCost,
} from "#batiment/effects/index";
import {
  collectEffectCharges,
  type EffectCharge,
  type EffectDeclaration,
} from "#tools/eslint/effects/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";
import type { Convention } from "#tools/eslint/ports/Convention";

/**
 * Creates a convention judging the effect charges of each file of a ranked role:
 * `create` receives the file's role, its ceilings, `exceeds`, whether a level
 * lies above a ceiling, and `exceeding`, the cost of a charge above the ceiling
 * it is judged against, at the invocation level its `declared` tag states when
 * it has one, and returns what judges each charge and each effect doc tag.
 *
 * @confined
 */
export function defineEffectConvention({
  severity,
  description,
  messages,
  hasSuggestions = false,
  create,
}: {
  severity: "error" | "info";
  description: string;
  messages: Record<string, string>;
  hasSuggestions?: boolean;
  create(
    context: Rule.RuleContext,
    unit: {
      role: string;
      ceilings: EffectCeilings;
      exceeds(level: string | undefined, ceiling: string): boolean;
      exceeding(charge: EffectCharge): EffectCost | undefined;
    },
  ): {
    charge(found: EffectCharge): void;
    declare?(found: EffectDeclaration): void;
  };
}): Convention {
  return defineConvention({
    files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
    typeAware: true,
    severity,
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
        hasSuggestions,
        description,
        messages,
        /**
         * @effectful
         */
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
          const unitCeilings = ceilings;
          const { levels } = effects;

          function exceeds(level: string | undefined, ceiling: string) {
            return (
              level === undefined ||
              levels.indexOf(level) > levels.indexOf(ceiling)
            );
          }

          function exceeding({
            operation,
            target,
            position,
            declared,
          }: EffectCharge): EffectCost | undefined {
            const cost = chargeEffect({
              operation,
              target,
              position,
              ceilings: declared === undefined
                ? unitCeilings
                : { ...unitCeilings, invocation: declared },
            });

            return cost !== undefined && exceeds(cost.level, cost.ceiling)
              ? cost
              : undefined;
          }

          const { charge, declare } = create(context, {
            role,
            ceilings,
            exceeds,
            exceeding,
          });

          const host = environment === undefined
            ? undefined
            : getOwn(globals, environment);

          const bundled = (
            environment !== undefined &&
            getOwn(execution, environment)?.bundled === true
          );

          const bundler = bundled && tool !== false ? tool : undefined;
          const replaced = bundler?.globals;

          // @debt each effect convention collects the file's charges anew, so linting a file with both runs the collector twice
          return collectEffectCharges({
            context,
            entities,
            effects,
            erased: bundler?.imports ?? {},
            tags: docs.tags,
            globals: [
              ...(replaced === undefined ? [] : [replaced]),
              ...(host?.ranks ?? []),
            ],
            aliases: host?.aliases ?? [],
            root,
            charge,
            declare(found) {
              declare?.(found);
            },
          });
        },
      });
    },
  });
}
