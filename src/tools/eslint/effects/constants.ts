import { freeze } from "@auaust/toolkit/object";

import type { EffectGlobals, EffectState } from "#batiment/effects/index";

export const functionNodeTypes: readonly string[] = freeze([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

export const classNodeTypes: readonly string[] = freeze([
  "ClassDeclaration",
  "ClassExpression",
]);

export const typeNodeTypes: ReadonlySet<string> = new Set([
  "TSTypeAnnotation",
  "TSTypeQuery",
  "TSTypeReference",
  "TSTypeAliasDeclaration",
  "TSInterfaceDeclaration",
  "TSTypeParameterInstantiation",
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

export const stateUnits = freeze({
  "own": "its own state",
  "received": "a value its caller passes",
  "closure": "a variable of an enclosing function",
  "unit-private": "its module's unexported state",
  "unit-shared": "its module's exported state",
  "external": "state outside its module",
}) satisfies Readonly<Record<EffectState, string>>;
