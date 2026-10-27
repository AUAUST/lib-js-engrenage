import { join } from "@auaust/primitive-kit/arrays";

import { defineRestriction } from "#eslint/conventions/defineRestriction";

const returned =
  ":matches(ReturnStatement, ArrowFunctionExpression) > UnaryExpression";

const inertOperands = join(
  [
    "ArrayExpression",
    "ArrowFunctionExpression",
    "ClassExpression",
    "FunctionExpression",
    "Identifier",
    "Literal",
    "MemberExpression",
    "MetaProperty",
    "ObjectExpression",
    "TemplateLiteral",
    "ThisExpression",
  ],
  "|",
);

export default defineRestriction({
  selector: `UnaryExpression[operator='void']:not(${returned}), ${returned}[operator='void'][argument.type=/^(${inertOperands})$/]`,
  message:
    "Use `void` only to discard the value of a returned action, as in `return void call()` or `() => void call()`.",
});
