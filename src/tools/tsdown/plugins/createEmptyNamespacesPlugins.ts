import type { TsdownPlugin } from "tsdown";

import { isString, iterable } from "@auaust/toolkit";
import { filter, isNonEmptyArray } from "@auaust/toolkit/array";

const declarationChunk = /\.d\.[cm]?ts$/;

const emptyNamespace = /\bvar\s+([$\w]+)\s*=\s*(?:\/\*\s*@__PURE__\s*\*\/\s*)?__exportAll\(\s*\{\s*\}\s*\);?/g;

export function createEmptyNamespacesPlugins(name: string): TsdownPlugin[] {
  const emptyNamespaces = new Map<string, string[]>();

  return [
    {
      name: `${name}:find`,
      renderChunk: {
        order: "pre",
        handler(code, { fileName }) {
          if (declarationChunk.test(fileName)) {
            const names = Array.from(code.matchAll(emptyNamespace), (match) => {
              return match[1];
            });

            emptyNamespaces.set(fileName, filter(names, isString));
          }

          return null;
        },
      },
    },
    {
      name: `${name}:declare`,
      renderChunk: {
        order: "post",
        handler(code, { fileName }) {
          const names = emptyNamespaces.get(fileName) ?? [];

          emptyNamespaces.delete(fileName);

          if (!isNonEmptyArray(names)) {
            return null;
          }

          const declarations = iterable.map(names, (name) => {
            return `declare const ${name}: {};`;
          });

          return {
            code: `${code.trimEnd()}\n${iterable.join(declarations, "\n")}\n`,
            map: null,
          };
        },
      },
    },
  ];
}
