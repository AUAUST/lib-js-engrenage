import { basename, extname } from "node:path";

import { indexRoleName } from "#project/roles/constants";
import {
  entitiesSection,
  isStructureEnvironment,
  structureSection,
} from "#project/structure/index";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";

const barrelHint =
  " If this file is intended as a barrel, enable `index` on the role.";

interface Exports {
  names: string[];
  defaults: number;
  star: boolean;
}

export default defineConvention({
  /** @debt `bin` has no lint scope, so its command modules are classified but never checked; a command group without an index.ts is accepted too */
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  sections: { entities: entitiesSection, structure: structureSection },
  rule: ({ entities, structure: structures }) => {
    return defineStructureRule({
      entities,
      description:
        "A module exports what its role's exports contract states: one named export matching the file, named exports, or one default export.",
      messages: {
        match:
          "A module of {{role}} exports only `{{name}}`, named after the file.{{hint}}",
        named:
          "A module of {{role}} uses named exports, never a default export.{{hint}}",
        default:
          "A module of {{role}} has one default export and no named export.{{hint}}",
      },
      create(context, { environment, role, contract, fileRole }) {
        const file = basename(context.filename);
        const style = contract?.exports;

        if (
          role === undefined ||
          style === undefined ||
          fileRole === indexRoleName
        ) {
          return {};
        }

        const name = basename(file, extname(file));

        const structure = isStructureEnvironment(environment)
          ? structures[environment]
          : undefined;

        const hint = file === structure?.indexFile ? barrelHint : "";

        const found: Exports = {
          names: [],
          defaults: 0,
          star: false,
        };

        return {
          ExportNamedDeclaration(statement) {
            const { declaration } = statement;

            if (declaration == null) {
              found.names.push(
                ...statement.specifiers.map(({ exported }) => {
                  return exported.type === "Identifier"
                    ? exported.name
                    : String(exported.value);
                }),
              );
            } else if (declaration.type === "VariableDeclaration") {
              for (const { id } of declaration.declarations) {
                if (id.type === "Identifier") {
                  found.names.push(id.name);
                }
              }
            } else if (
              "id" in declaration &&
              declaration.id?.type === "Identifier"
            ) {
              found.names.push(declaration.id.name);
            }
          },
          ExportDefaultDeclaration() {
            found.defaults += 1;
          },
          ExportAllDeclaration() {
            found.star = true;
          },
          "Program:exit"(program) {
            const distinct = [...new Set(found.names)];

            if (style === "named-match") {
              if (
                found.defaults > 0 ||
                found.star ||
                distinct.length !== 1 ||
                distinct[0] !== name
              ) {
                context.report({
                  node: program,
                  messageId: "match",
                  data: {
                    role,
                    name,
                    hint,
                  },
                });
              }
            } else if (style === "named") {
              if (found.defaults > 0) {
                context.report({
                  node: program,
                  messageId: "named",
                  data: { role, hint },
                });
              }
            } else if (
              found.defaults !== 1 ||
              distinct.length > 0 ||
              found.star
            ) {
              context.report({
                node: program,
                messageId: "default",
                data: { role, hint },
              });
            }
          },
        };
      },
    });
  },
});
