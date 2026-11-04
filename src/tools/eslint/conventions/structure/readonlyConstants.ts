import { basename } from "node:path";

import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";
import { isDeeplyReadonly } from "#tools/eslint/utils/isDeeplyReadonly";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling"],
  typeAware: true,
  rule: (config) => {
    return defineStructureRule({
      config,
      description: "A constants.ts exports deeply read-only values.",
      messages: {
        mutable:
          "`{{name}}` is not deeply read-only; declare it `as const` or wrap it in `freeze`, or move it out of constants.ts.",
      },
      create(context) {
        const services = context.sourceCode.parserServices;

        if (
          basename(context.filename) !== "constants.ts" ||
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
