import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";
import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";

const allowed = new Set([
  "ImportDeclaration",
  "TSInterfaceDeclaration",
  "TSTypeAliasDeclaration",
  "TSDeclareFunction",
  "TSExportAssignment",
]);

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  sections: { entities: "entities" },
  rule: ({ entities }) => {
    return defineStructureRule({
      entities,
      description: "A module of a type-only role declares types only.",
      messages: {
        value:
          "A module of a type-only role declares no runtime value; move this declaration into a role that holds values.",
      },
      create(context, { kind, contract }) {
        if (kind !== "role" || contract?.typeOnly !== true) {
          return {};
        }

        return {
          Program(program) {
            for (const statement of program.body) {
              const type: string = statement.type;

              if (type === "ExportAllDeclaration") {
                if (!isTypeOnlyNode(statement)) {
                  context.report({ node: statement, messageId: "value" });
                }

                continue;
              }

              if (
                statement.type === "ExportNamedDeclaration" &&
                statement.source != null
              ) {
                if (
                  !isTypeOnlyNode(statement) &&
                  !statement.specifiers.every(isTypeOnlyNode)
                ) {
                  context.report({ node: statement, messageId: "value" });
                }

                continue;
              }

              const declared: {
                readonly type: string;
                readonly kind?: unknown;
              } = statement;

              if (
                declared.type === "TSModuleDeclaration" &&
                declared.kind === "global"
              ) {
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
