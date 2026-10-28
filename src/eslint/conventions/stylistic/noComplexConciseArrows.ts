import { join } from "@auaust/primitive-kit/arrays";

import { defineRestriction } from "#eslint/conventions/defineRestriction";

const conciseBodies = join(
  [
    "ArrayExpression",
    "BlockStatement",
    "Identifier",
    "Literal",
    "MemberExpression",
    "UnaryExpression",
    "BinaryExpression",
    "CallExpression",
    "TemplateLiteral",
    "TSAsExpression",
  ],
  "|",
);

const constAssertedBodies = join(
  ["ArrayExpression", "Literal", "TemplateLiteral"],
  "|",
);

const complexArray =
  "ArrayExpression:has(> :not(Identifier, Literal, MemberExpression))";

const complexBodies = join(
  [
    `ArrowFunctionExpression[body.type!=/^(${conciseBodies})$/]`,
    `ArrowFunctionExpression[body.type='TSAsExpression']:not([body.typeAnnotation.typeName.name='const'][body.expression.type=/^(${constAssertedBodies})$/])`,
    `ArrowFunctionExpression:has(> ${complexArray})`,
    `ArrowFunctionExpression:has(> TSAsExpression:has(> ${complexArray}))`,
  ],
  ", ",
);

export default defineRestriction({
  selector: complexBodies,
  message:
    "Use a block body with an explicit return; concise bodies are only for a short identifier, literal, member access, negation, comparison, call, template literal, array of identifiers, literals or member accesses, or one of those asserted `as const`.",
});
