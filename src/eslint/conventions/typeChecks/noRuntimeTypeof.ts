import { defineReplacement } from "#eslint/conventions/defineReplacement";

export default defineReplacement({
  selector:
    "UnaryExpression[operator='typeof']:not(BinaryExpression[operator=/^[!=]==$/][right.type='Literal'][right.value='undefined'] > UnaryExpression.left)",
  target: 'runtime `typeof` (except `typeof x === "undefined"`)',
  replacement: "`is<Type>` helpers",
});
