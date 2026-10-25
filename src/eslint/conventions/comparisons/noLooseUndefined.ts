import { defineReplacement } from "#eslint/conventions/defineReplacement";

export default defineReplacement({
  selector:
    "BinaryExpression[operator=/^[!=]=$/]:matches([right.type='Identifier'][right.name='undefined'], [left.type='Identifier'][left.name='undefined'])",
  target: "loose comparisons with `undefined`",
  replacement: "`x == null`",
});
