import type { TsdownPlugin } from "tsdown";

import { filter, isNotEmpty, join, map } from "@auaust/primitive-kit/arrays";
import { isString } from "@auaust/toolkit/isString";

const declarationChunk = /\.d\.[cm]?ts$/;

const emptyNamespace =
  /\bvar\s+([$\w]+)\s*=\s*(?:\/\*\s*@__PURE__\s*\*\/\s*)?__exportAll\(\s*\{\s*\}\s*\);?/g;

// @debt the rolldown plugin names restate the "empty-namespaces" key of pluginNames instead of deriving it, so renaming the key leaves them stale
export function createEmptyNamespacesPlugins(): TsdownPlugin[] {
  const emptyNamespaces = new Map<string, string[]>();

  return [
    {
      name: "engrenage:empty-namespaces:find",
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
      name: "engrenage:empty-namespaces:declare",
      renderChunk: {
        order: "post",
        handler(code, { fileName }) {
          const names = emptyNamespaces.get(fileName) ?? [];

          emptyNamespaces.delete(fileName);

          if (!isNotEmpty(names)) {
            return null;
          }

          const declarations = map(names, (name) => {
            return `declare const ${name}: {};`;
          });

          return {
            code: `${code.trimEnd()}\n${join(declarations, "\n")}\n`,
            map: null,
          };
        },
      },
    },
  ];
}
