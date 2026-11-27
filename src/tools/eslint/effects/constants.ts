import { freeze } from "@auaust/toolkit/object";

import type { EffectGlobals } from "#batiment/effects/index";

export const functionNodeTypes: readonly string[] = freeze([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

export const classNodeTypes: readonly string[] = freeze([
  "ClassDeclaration",
  "ClassExpression",
]);

export const globalObject = "globalThis";

export const ecmascriptGlobals = freeze({
  Date: freeze({ level: "pure", symbols: freeze({ now: "observing" }) }),
  Math: freeze({ level: "pure", symbols: freeze({ random: "observing" }) }),
  performance: freeze({
    level: "effectful",
    symbols: freeze({ now: "observing", timeOrigin: "observing" }),
  }),
}) satisfies EffectGlobals;
