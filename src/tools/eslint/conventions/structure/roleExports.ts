import { basename, extname } from "node:path";

import type { Scope } from "eslint";

import { getOwn } from "@auaust/toolkit/object";

import { indexRoleName } from "#project/roles/constants";
import { defineConvention } from "#tools/eslint/utils/defineConvention";
import { defineStructureRule } from "#tools/eslint/utils/defineStructureRule";
import { isTypeOnlyNode } from "#tools/eslint/utils/isTypeOnlyNode";

const barrelHint = " If this file is intended as a barrel, enable `index` on the role.";

const typeDeclarations = new Set([
  "TSInterfaceDeclaration",
  "TSTypeAliasDeclaration",
]);

interface KindExports {
  names: Set<string>;
  star: boolean;
}

function isTypeBinding(scope: Scope.Scope, name: string): boolean {
  const variable = scope.set.get(name);

  return (
    variable !== undefined &&
    "isValueVariable" in variable &&
    variable.isValueVariable === false
  );
}

export default defineConvention({
  /** @debt `bin` has no lint scope, so its command modules are classified but never checked; a command group without an index.ts is accepted too */
  files: ["files.src", "files.scripts", "files.tooling", "files.tests"],
  sections: { entities: "entities", structure: "structure" },
  rule: ({ entities, structure: structures }) => {
    return defineStructureRule({
      entities,
      description: "A module exports what its role's exports contract states, for values and types apart: only the file's name, named exports, one default export, or none.",
      messages: {
        "values-match": "A module of {{role}} exports only the value `{{name}}`, named after the file, and no default export.{{hint}}",
        "values-named": "A module of {{role}} exports named values, never a default export.{{hint}}",
        "values-default": "A module of {{role}} has one default export and no named value.{{hint}}",
        "values-none": "A module of {{role}} exports no value.{{hint}}",
        "types-match": "A module of {{role}} exports only the type `{{name}}`, named after the file.{{hint}}",
        "types-none": "A module of {{role}} exports no type.{{hint}}",
        "missing": "A module of {{role}} exports `{{name}}`, named after the file, as a value or a type.{{hint}}",
      },
      create(context, { environment, role, contract, fileRole }) {
        if (
          role === undefined ||
          contract === undefined ||
          fileRole === indexRoleName
        ) {
          return {};
        }

        const { values: valueStyle, types: typeStyle } = contract.exports;

        if (valueStyle === undefined && typeStyle === undefined) {
          return {};
        }

        const file = basename(context.filename);

        const name = basename(file, extname(file));

        const structure = getOwn(structures, environment);

        const hint = file === structure?.indexFile ? barrelHint : "";

        const values: KindExports = { names: new Set(), star: false };
        const types: KindExports = { names: new Set(), star: false };

        let defaults = 0;

        function onlyNamed({ names, star }: KindExports): boolean {
          return !star && [...names].every((exported) => exported === name);
        }

        function isEmpty({ names, star }: KindExports): boolean {
          return !star && names.size === 0;
        }

        function checkValues(): string[] {
          if (valueStyle === "named-match") {
            return defaults > 0 || !onlyNamed(values) ? ["values-match"] : [];
          }

          if (valueStyle === "named") {
            return defaults > 0 ? ["values-named"] : [];
          }

          if (valueStyle === "default") {
            return defaults !== 1 || !isEmpty(values) ? ["values-default"] : [];
          }

          if (valueStyle === "none") {
            return defaults > 0 || !isEmpty(values) ? ["values-none"] : [];
          }

          return [];
        }

        function checkTypes(): string[] {
          if (typeStyle === "named-match") {
            return onlyNamed(types) ? [] : ["types-match"];
          }

          if (typeStyle === "none") {
            return isEmpty(types) ? [] : ["types-none"];
          }

          return [];
        }

        return {
          "ExportNamedDeclaration"(statement) {
            const { declaration } = statement;

            if (declaration == null) {
              const scope = context.sourceCode.getScope(statement);

              for (const specifier of statement.specifiers) {
                const { exported, local } = specifier;

                const exportedName = exported.type === "Identifier"
                  ? exported.name
                  : String(exported.value);

                // @debt a binding re-exported from another module without `type` counts as a value, since only type information could tell its kind
                const isType = (
                  isTypeOnlyNode(statement) ||
                  isTypeOnlyNode(specifier) ||
                  (statement.source == null &&
                    local.type === "Identifier" &&
                    isTypeBinding(scope, local.name))
                );

                (isType ? types : values).names.add(exportedName);
              }

              return;
            }

            const type: string = declaration.type;
            const kind = typeDeclarations.has(type) ? types : values;

            if (declaration.type === "VariableDeclaration") {
              for (const { id } of declaration.declarations) {
                if (id.type === "Identifier") {
                  kind.names.add(id.name);
                }
              }
            } else if (
              "id" in declaration &&
              declaration.id?.type === "Identifier"
            ) {
              kind.names.add(declaration.id.name);
            }
          },
          "ExportDefaultDeclaration"() {
            defaults += 1;
          },
          "ExportAllDeclaration"(statement) {
            (isTypeOnlyNode(statement) ? types : values).star = true;
          },
          "Program:exit"(program) {
            const failures = [...checkValues(), ...checkTypes()];

            const matched = [
              valueStyle === "named-match" ? values : undefined,
              typeStyle === "named-match" ? types : undefined,
            ].filter((kind) => kind !== undefined);

            if (
              failures.length === 0 &&
              matched.length > 0 &&
              matched.every((kind) => !kind.names.has(name))
            ) {
              failures.push(
                matched.length === 2
                  ? "missing"
                  : matched[0] === values
                    ? "values-match"
                    : "types-match",
              );
            }

            for (const messageId of failures) {
              context.report({
                node: program,
                messageId,
                data: {
                  role,
                  name,
                  hint,
                },
              });
            }
          },
        };
      },
    });
  },
});
