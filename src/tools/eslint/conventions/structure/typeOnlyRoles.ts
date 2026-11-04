import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

function isTypeKind(node: object): boolean {
  return "exportKind" in node && node.exportKind === "type";
}

const allowed = new Set([
  "ImportDeclaration",
  "TSInterfaceDeclaration",
  "TSTypeAliasDeclaration",
  "TSDeclareFunction",
  "TSExportAssignment",
]);

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  rule: (config) => {
    return defineStructureRule({
      config,
      description: "A module of a type-only role declares types only.",
      messages: {
        value:
          "A module of a type-only role declares no runtime value; move this declaration into a role that holds values.",
      },
      create(context, { node, contract }) {
        if (node.kind !== "role" || contract?.typeOnly !== true) {
          return {};
        }

        return {
          Program(program) {
            for (const statement of program.body) {
              const type: string = statement.type;

              if (type === "ExportAllDeclaration") {
                if (!isTypeKind(statement)) {
                  context.report({ node: statement, messageId: "value" });
                }

                continue;
              }

              if (
                statement.type === "ExportNamedDeclaration" &&
                statement.source != null
              ) {
                if (
                  !isTypeKind(statement) &&
                  !statement.specifiers.every(isTypeKind)
                ) {
                  context.report({ node: statement, messageId: "value" });
                }

                continue;
              }

              const inner: { type: string } | null | undefined =
                type === "ExportNamedDeclaration" && "declaration" in statement
                  ? statement.declaration
                  : statement;

              if (
                inner == null ||
                allowed.has(inner.type) ||
                allowed.has(type)
              ) {
                continue;
              }

              context.report({ node: statement, messageId: "value" });
            }
          },
        };
      },
    });
  },
});
