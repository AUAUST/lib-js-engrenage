import { entitiesSection } from "#project/structure/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";
import { isDeeplyReadonly } from "#tools/eslint/utils/isDeeplyReadonly";

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling"],
  typeAware: true,
  sections: { entities: entitiesSection },
  rule: ({ entities }) => {
    return defineStructureRule({
      entities,
      description: "The constants file exports deeply read-only values.",
      messages: {
        mutable:
          "`{{name}}` is not deeply read-only; declare it `as const` or wrap it in `freeze`, or move it out of the constants file.",
      },
      create(context, { fileRole }) {
        const services = context.sourceCode.parserServices;

        // @debt the constants role is found by its preset name, so a project that renames it loses the check
        if (
          fileRole !== "constants" ||
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
