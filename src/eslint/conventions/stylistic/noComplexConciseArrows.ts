import { defineRestriction } from "#eslint/conventions/defineRestriction";

export default defineRestriction({
  selector:
    "ArrowFunctionExpression[body.type!=/^(BlockStatement|Identifier|Literal|MemberExpression|UnaryExpression|BinaryExpression|CallExpression|TemplateLiteral)$/]",
  message:
    "Use a block body with an explicit return; concise bodies are only for a short identifier, literal, member access, negation, comparison, call or template literal.",
});
