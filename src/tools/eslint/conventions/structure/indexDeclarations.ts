import { entryRoleName, indexRoleName } from "#project/roles/constants";
import { entitiesSection } from "#project/structure/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

const metadata = /^[A-Z][A-Z0-9_]*$/;

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling"],
  sections: { entities: entitiesSection },
  rule: ({ entities }) => {
    return defineStructureRule({
      entities,
      description:
        "A domain index, an enabled role barrel or an entry re-exports and declares no local value, except a SCREAMING_CASE constant of metadata; the index.ts of a command group declares its command.",
      messages: {
        value:
          "An index.ts or entry.ts only re-exports; move this declaration into a module of the domain's roles.",
      },
      create(context, { fileRole, commands }) {
        if (
          (fileRole !== indexRoleName && fileRole !== entryRoleName) ||
          commands
        ) {
          return {};
        }

        return {
          Program(program) {
            // @debt `export default <expression>` is never inspected, so an index.ts may run code at import, as `#tools/prettier/index` does with `definePrettierConfig()`
            for (const statement of program.body) {
              const type: string = statement.type;

              const declaration:
                | {
                    type: string;
                    kind?: string;
                    declarations?: { id: { type: string; name?: string } }[];
                  }
                | null
                | undefined =
                type === "ExportNamedDeclaration" && "declaration" in statement
                  ? statement.declaration
                  : statement;

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

              const isMetadata =
                declaration.type === "VariableDeclaration" &&
                declaration.kind === "const" &&
                (declaration.declarations ?? []).every(({ id }) => {
                  return (
                    id.type === "Identifier" && metadata.test(id.name ?? "")
                  );
                });

              if (isValue && !isMetadata) {
                context.report({ node: statement, messageId: "value" });
              }
            }
          },
        };
      },
    });
  },
});
