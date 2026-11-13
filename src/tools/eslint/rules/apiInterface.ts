import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";

import { defineRoleRule } from "#tools/eslint/utils/defineRoleRule";

function isInterface(node: {
  type: string;
}): node is TSESTree.TSInterfaceDeclaration {
  return node.type === AST_NODE_TYPES.TSInterfaceDeclaration;
}

function findInterface(
  node: { type: string } | null | undefined,
): TSESTree.TSInterfaceDeclaration | undefined {
  return node != null && isInterface(node) ? node : undefined;
}

function isFunctionTyped(member: TSESTree.TypeElement): boolean {
  return (
    member.type === AST_NODE_TYPES.TSMethodSignature ||
    (member.type === AST_NODE_TYPES.TSPropertySignature &&
      member.typeAnnotation?.typeAnnotation.type ===
        AST_NODE_TYPES.TSFunctionType)
  );
}

export const apiInterface = defineRoleRule({
  description: "A module of `apis` exports exactly one interface, with at least one method or function-typed member.",
  messages: {
    single: "A module of `apis` exports exactly one interface and nothing else.",
    methods: "The interface `{{name}}` has no method nor function-typed member; a data shape belongs in `types/`.",
  },
  create(context) {
    return {
      Program(program) {
        const interfaces = new Map<string, TSESTree.TSInterfaceDeclaration[]>();

        const exported = new Set<string>();

        const specified: string[] = [];

        let others = 0;

        function addInterface(declaration: TSESTree.TSInterfaceDeclaration) {
          const merged = interfaces.get(declaration.id.name) ?? [];

          merged.push(declaration);
          interfaces.set(declaration.id.name, merged);
        }

        for (const statement of program.body) {
          const standalone = findInterface(statement);

          if (standalone !== undefined) {
            addInterface(standalone);
          } else if (statement.type === "ExportNamedDeclaration") {
            const { declaration, source, specifiers } = statement;

            const declared = findInterface(declaration);

            if (declared !== undefined) {
              addInterface(declared);
              exported.add(declared.id.name);
            } else if (declaration != null) {
              others += 1;
            }

            for (const { local } of specifiers) {
              if (source == null && local.type === "Identifier") {
                specified.push(local.name);
              } else {
                others += 1;
              }
            }
          } else if (
            statement.type === "ExportDefaultDeclaration" ||
            statement.type === "ExportAllDeclaration"
          ) {
            others += 1;
          }
        }

        for (const local of specified) {
          if (interfaces.has(local)) {
            exported.add(local);
          } else {
            others += 1;
          }
        }

        const [name] = exported;

        if (name === undefined || exported.size > 1 || others > 0) {
          return void context.report({ node: program, messageId: "single" });
        }

        const declarations = interfaces.get(name) ?? [];

        const callable = declarations.some(({ body }) => {
          return body.body.some(isFunctionTyped);
        });

        if (!callable) {
          context.report({
            node: program,
            messageId: "methods",
            data: { name },
          });
        }
      },
    };
  },
});
