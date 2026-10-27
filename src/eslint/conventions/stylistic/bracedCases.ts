import { defineConvention } from "#eslint/conventions/defineConvention";

const message = "Wrap the statements of each `case` in a block.";

export default defineConvention({
  rule: {
    meta: {
      type: "suggestion",
      fixable: "code",
      docs: {
        description: message,
      },
      messages: {
        bracedCases: message,
      },
      schema: [],
    },
    create(context) {
      return {
        SwitchCase(node) {
          const { consequent } = node;

          const [first] = consequent;

          const last = consequent.at(-1);

          if (
            first === undefined ||
            last === undefined ||
            (consequent.length === 1 && first.type === "BlockStatement")
          ) {
            return;
          }

          const declaresScopedBindings = consequent.some((statement) => {
            return (
              statement.type === "ClassDeclaration" ||
              statement.type === "FunctionDeclaration" ||
              (statement.type === "VariableDeclaration" &&
                statement.kind !== "var")
            );
          });

          context.report({
            node,
            messageId: "bracedCases",
            fix: declaresScopedBindings
              ? null
              : (fixer) => {
                  return [
                    fixer.insertTextBefore(first, "{ "),
                    fixer.insertTextAfter(last, " }"),
                  ];
                },
          });
        },
      };
    },
  },
});
