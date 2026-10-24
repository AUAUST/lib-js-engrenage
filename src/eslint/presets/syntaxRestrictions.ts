import type { SyntaxRestriction } from "#eslint/types/SyntaxRestriction";

export const syntaxRestrictions: SyntaxRestriction[] = [
  {
    selector:
      "UnaryExpression[operator='typeof']:not(BinaryExpression[operator=/^[!=]==$/][right.type='Literal'][right.value='undefined'] > UnaryExpression.left)",
    message:
      'Use is<Type> helpers; runtime typeof is only for `typeof x === "undefined"`.',
  },
  {
    selector:
      "BinaryExpression[operator=/^[!=]=$/]:matches([right.type='Identifier'][right.name='undefined'], [left.type='Identifier'][left.name='undefined'])",
    message: "Loose nullish checks compare with null: `x == null`.",
  },
  {
    selector: "CallExpression[callee.name=/^is(Null|Undefined)$/]",
    message:
      "Compare directly (`x === null`, `x === undefined`); isNull and isUndefined are only for callbacks such as `filter(items, isNull)`.",
  },
  {
    selector:
      "ArrowFunctionExpression[body.type!=/^(BlockStatement|Identifier|Literal|MemberExpression|UnaryExpression|BinaryExpression|CallExpression)$/]",
    message:
      "Use a block body with an explicit return; concise bodies are only for a short identifier, literal, member access, negation, comparison or call.",
  },
];
