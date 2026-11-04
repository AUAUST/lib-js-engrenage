import { basename } from "node:path";

import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

const metadata = /^[A-Z][A-Z0-9_]*$/;

export default defineConvention({
  files: ["files.src", "files.scripts", "files.tooling"],
  rule: (config) => {
    return defineStructureRule({
      config,
      description:
        "An index.ts re-exports and declares no local value, except a SCREAMING_CASE constant of metadata; the index.ts of a command group declares its command.",
      messages: {
        value:
          "An index.ts only re-exports; move this declaration into a module of the domain's roles.",
      },
      create(context, { indexFile, node }) {
        if (
          basename(context.filename) !== indexFile ||
          node.commands === true
        ) {
          return {};
        }

        return {
          Program(program) {
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
