import { basename, matchesGlob } from "node:path";

import { wrap } from "@auaust/primitive-kit/arrays";

import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";
import { isDeeplyReadonly } from "#tools/eslint/utils/isDeeplyReadonly";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling"],
  typeAware: true,
  rule: (config) => {
    return defineStructureRule({
      config,
      description: "The constants file exports deeply read-only values.",
      messages: {
        mutable:
          "`{{name}}` is not deeply read-only; declare it `as const` or wrap it in `freeze`, or move it out of the constants file.",
      },
      create(context, { environment }) {
        const globs = wrap(
          config[environment].roles.roles.constants?.file ?? [],
        );

        const services = context.sourceCode.parserServices;

        if (
          !globs.some((glob) =>
            matchesGlob(basename(context.filename), glob),
          ) ||
          services?.program == null ||
          services.esTreeNodeToTSNodeMap == null
        ) {
          return {};
        }

        const checker = services.program.getTypeChecker();

        return {
          ExportNamedDeclaration({ declaration }) {
            if (declaration?.type !== "VariableDeclaration") {
              return;
            }

            for (const declarator of declaration.declarations) {
              if (declarator.id.type !== "Identifier") {
                continue;
              }

              const type = checker.getTypeAtLocation(
                services.esTreeNodeToTSNodeMap.get(declarator.id),
              );

              if (!isDeeplyReadonly(type, checker)) {
                context.report({
                  node: declarator.id,
                  messageId: "mutable",
                  data: { name: declarator.id.name },
                });
              }
            }
          },
        };
      },
    });
  },
});
