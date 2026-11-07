import type { Rule, Scope } from "eslint";

import { defineRoleRule } from "#tools/eslint/utils/defineRoleRule";

type Initializer = Extract<
  Scope.DefinitionType,
  { type: "Variable" }
>["node"]["init"];

const declarerName = "declareSection";

function isDeclaration(init: Initializer) {
  return (
    init?.type === "CallExpression" &&
    init.callee.type === "Identifier" &&
    init.callee.name === declarerName
  );
}

function initializerOf(variable: Scope.Variable | undefined): Initializer {
  const definition = variable?.defs[0];

  return definition?.type === "Variable" ? definition.node.init : undefined;
}

export const sectionDeclarations = defineRoleRule({
  description:
    "A section module's export is initialized with a `declareSection(…)` call.",
  messages: {
    notDeclared:
      "Initialize the export `{{name}}` with a `declareSection(…)` call.",
  },
  create(context) {
    function report(node: Rule.Node, name: string) {
      context.report({
        node,
        messageId: "notDeclared",
        data: { name },
      });
    }

    return {
      ExportDefaultDeclaration(node) {
        report(node, "default");
      },
      ExportNamedDeclaration(node) {
        const { declaration, specifiers, source } = node;

        if (declaration?.type === "VariableDeclaration") {
          for (const { id, init } of declaration.declarations) {
            if (!isDeclaration(init)) {
              report(node, id.type === "Identifier" ? id.name : "binding");
            }
          }

          return;
        }

        if (
          declaration?.type === "FunctionDeclaration" ||
          declaration?.type === "ClassDeclaration"
        ) {
          return void report(node, declaration.id.name);
        }

        const scope = context.sourceCode.getScope(node);

        for (const { local, exported } of specifiers) {
          const init =
            source == null && local.type === "Identifier"
              ? initializerOf(scope.set.get(local.name))
              : undefined;

          if (!isDeclaration(init)) {
            report(
              node,
              exported.type === "Identifier"
                ? exported.name
                : String(exported.value),
            );
          }
        }
      },
    };
  },
});
