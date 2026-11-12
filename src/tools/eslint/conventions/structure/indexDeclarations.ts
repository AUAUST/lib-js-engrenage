import { indexRoleName } from "#project/roles/constants";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

const metadata = /^[A-Z][A-Z0-9_]*$/;

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling"],
  sections: { entities: "entities" },
  rule: ({ entities }) => {
    return defineStructureRule({
      entities,
      description: "A domain index or an enabled role barrel only re-exports: it declares no local value, except a SCREAMING_CASE constant of metadata, and default-exports no expression; the index.ts of a command group declares its command.",
      messages: {
        value: "An index.ts only re-exports; move this code into a module of the domain's roles, or into its entry.ts if consumers need it at import.",
      },
      create(context, { fileRole, commands }) {
        if (fileRole !== indexRoleName || commands) {
          return {};
        }

        return {
          Program(program) {
            for (const statement of program.body) {
              if (statement.type === "ExportDefaultDeclaration") {
                const exportedType: string = statement.declaration.type;

                if (
                  exportedType !== "Identifier" &&
                  exportedType !== "TSInterfaceDeclaration"
                ) {
                  context.report({
                    node: statement,
                    messageId: "value",
                  });
                }

                continue;
              }

              const type: string = statement.type;

              const declaration:
                | {
                    type: string;
                    kind?: string;
                    declarations?: {
                      id: { type: string; name?: string };
                    }[];
                  }
                | null
                | undefined = type === "ExportNamedDeclaration" && "declaration" in statement ? statement.declaration : statement;

              if (declaration == null) {
                continue;
              }

              const isValue = [
                "FunctionDeclaration",
                "ClassDeclaration",
                "ExpressionStatement",
                "TSEnumDeclaration",
                "VariableDeclaration",
              ].includes(declaration.type);

              const isMetadata = (
                declaration.type === "VariableDeclaration" &&
                declaration.kind === "const" &&
                (declaration.declarations ?? []).every(({ id }) => {
                  return (
                    id.type === "Identifier" && metadata.test(id.name ?? "")
                  );
                })
              );

              if (isValue && !isMetadata) {
                context.report({
                  node: statement,
                  messageId: "value",
                });
              }
            }
          },
        };
      },
    });
  },
});
