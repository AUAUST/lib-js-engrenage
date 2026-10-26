import { defineReplacement } from "#eslint/conventions/defineReplacement";

export default defineReplacement({
  selector:
    "BinaryExpression[operator=/^[!=]==?$/]:not([left.type='Literal'][left.value='undefined'], [right.type='Literal'][right.value='undefined']) > UnaryExpression[operator='typeof']",
  target: 'runtime `typeof` comparisons (except `typeof x === "undefined"`)',
  replacement: "`is<Type>` helpers",
});
