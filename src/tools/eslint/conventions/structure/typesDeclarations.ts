import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

const allowed = new Set([
  "ImportDeclaration",
  "ExportAllDeclaration",
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
      description: "A types/ module declares types only.",
      messages: {
        value:
          "A types/ module declares no runtime value; move this declaration into utils/, operations/ or constants.ts.",
      },
      create(context, { node }) {
        if (node.role?.split("/").at(-1) !== "types") {
          return {};
        }

        return {
          Program(program) {
            for (const statement of program.body) {
              const type: string = statement.type;

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
