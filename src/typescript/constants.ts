import { freeze, keys } from "@auaust/toolkit/object";

import type { BlockSyntax } from "#types/BlockSyntax";
import type { Glob } from "#types/Glob";

// @debt Timer handles are typed `number`, the DOM signature, while Node returns an object; `setTimeout` results are not isomorphic.
export const apiGroupRoots = freeze({
  abort: ["AbortController", "AbortSignal"],
  blob: ["Blob", "File"],
  compression: ["CompressionStream", "DecompressionStream"],
  console: ["console"],
  crypto: ["crypto"],
  encoding: ["TextEncoder", "TextDecoder", "atob", "btoa"],
  events: ["Event", "EventTarget", "CustomEvent"],
  exceptions: ["DOMException"],
  microtasks: ["queueMicrotask"],
  performance: ["performance"],
  streams: [
    "ReadableStream",
    "WritableStream",
    "TransformStream",
    "ByteLengthQueuingStrategy",
    "CountQueuingStrategy",
    "TextEncoderStream",
    "TextDecoderStream",
  ],
  timers: ["setTimeout", "setInterval", "clearTimeout", "clearInterval"],
  url: ["URL", "URLSearchParams"],
} as const) satisfies Record<string, readonly string[]>;

export const apiGroups = freeze(keys(apiGroupRoots));

export const baselineWidelyAvailableMonths = 30;

export const barrelFiles = "**/index.ts" satisfies Glob;

export const declarationExtension = ".d.ts";

export const identifierPattern = /^[$A-Z_a-z][\w$]*$/;

export const noInputsDiagnostic = 18_003;

export const typescriptBlocks = freeze({
  open: "// ",
  close: "",
  padding: "\n",
} as const) satisfies BlockSyntax;
