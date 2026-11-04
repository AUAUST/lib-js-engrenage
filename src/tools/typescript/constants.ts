import { freeze } from "@auaust/toolkit/object";

import type { BlockSyntax } from "#types/BlockSyntax";
import type { Glob } from "#types/Glob";

export const barrelFiles = "**/index.ts" satisfies Glob;

export const declarationExtension = ".d.ts";

export const esInterfaceAliases = freeze({
  ReadonlyArray: "Array",
  ReadonlySet: "Set",
  ReadonlyMap: "Map",
  IteratorObject: "Iterator",
  IterableIterator: "Iterator",
  ArrayIterator: "Iterator",
  MapIterator: "Iterator",
  SetIterator: "Iterator",
  StringIterator: "Iterator",
  RegExpStringIterator: "Iterator",
  AsyncIteratorObject: "AsyncIterator",
  AsyncIterableIterator: "AsyncIterator",
} as const) satisfies Record<string, string>;

// @debt twenty entries map an `X.@@toStringTag` member to the same key, one per interface; a pattern rule would state it once
export const esMemberCompatKeys = freeze({
  "WeakKeyTypes.symbol": "javascript.builtins.WeakMap.symbol_as_keys",
  "RegExpMatchArray.indices": "javascript.builtins.RegExp.hasIndices",
  "RegExpExecArray.indices": "javascript.builtins.RegExp.hasIndices",
  "RegExpMatchArray.groups":
    "javascript.regular_expressions.named_capturing_group",
  "RegExpExecArray.groups":
    "javascript.regular_expressions.named_capturing_group",
  "IArguments.@@iterator": "javascript.functions.arguments.@@iterator",
  "ArrayBufferTypes.SharedArrayBuffer": "javascript.builtins.SharedArrayBuffer",
  "Intl.NumberFormatOptionsSignDisplayRegistry.negative":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_signDisplay_parameter.negative",
  "Intl.DateTimeFormatPartTypesRegistry.fractionalSecond":
    "javascript.builtins.Intl.DateTimeFormat.DateTimeFormat.options_parameter.options_fractionalSecondDigits_parameter",
  "PromiseConstructor.prototype": "javascript.builtins.Promise",
  "SymbolConstructor.prototype": "javascript.builtins.Symbol",
  "IteratorObject.@@toStringTag": "javascript.builtins.Iterator.Iterator",
  "Intl.DateTimeFormatPartTypesRegistry.unknown":
    "javascript.builtins.Intl.DateTimeFormat.formatToParts",
  "Intl.NumberFormatOptionsStyleRegistry.unit":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_unit_parameter",
  "Intl.NumberFormatOptionsCurrencyDisplayRegistry.narrowSymbol":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_currencyDisplay_parameter",
  "Intl.NumberFormatPartTypeRegistry.compact":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_notation_parameter",
  "Intl.NumberFormatPartTypeRegistry.exponentInteger":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_notation_parameter",
  "Intl.NumberFormatPartTypeRegistry.exponentMinusSign":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_notation_parameter",
  "Intl.NumberFormatPartTypeRegistry.exponentSeparator":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_notation_parameter",
  "Intl.NumberFormatPartTypeRegistry.unit":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_unit_parameter",
  "Intl.NumberFormatPartTypeRegistry.unknown":
    "javascript.builtins.Intl.NumberFormat.formatToParts",
  "Intl.DateTimeFormatOptions.formatMatcher":
    "javascript.builtins.Intl.DateTimeFormat.DateTimeFormat",
  "Intl.ResolvedDateTimeFormatOptions.formatMatcher":
    "javascript.builtins.Intl.DateTimeFormat.DateTimeFormat",
  "Intl.NumberFormatOptionsUseGroupingRegistry.min2":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_useGrouping_parameter.string_values",
  "Intl.NumberFormatOptionsUseGroupingRegistry.auto":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_useGrouping_parameter.string_values",
  "Intl.NumberFormatOptionsUseGroupingRegistry.always":
    "javascript.builtins.Intl.NumberFormat.NumberFormat.options_parameter.options_useGrouping_parameter.string_values",
  "Symbol.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Map.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "WeakMap.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Set.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "WeakSet.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "JSON.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "GeneratorFunction.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Math.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Promise.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "ArrayBuffer.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "DataView.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Int8Array.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Uint8Array.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Uint8ClampedArray.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Int16Array.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Uint16Array.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Int32Array.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Uint32Array.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Float32Array.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
  "Float64Array.@@toStringTag": "javascript.builtins.Symbol.toStringTag",
} as const) satisfies Record<string, string>;

export const identifierPattern = /^[$A-Z_a-z][\w$]*$/;

export const typescriptBlocks = freeze({
  open: "// ",
  close: "",
  padding: "\n",
} as const) satisfies BlockSyntax;
