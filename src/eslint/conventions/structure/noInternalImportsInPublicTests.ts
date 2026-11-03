import { dirname } from "node:path";

import { defineConvention } from "#eslint/conventions/defineConvention";
import { visitImportSources } from "#eslint/utils/visitImportSources";
import { isWithin } from "#support/filesystem/utils/isWithin";
import { resolve } from "#support/filesystem/utils/resolve";
import { resolveSubpathImport } from "#typescript/utils/resolveSubpathImport";

const message =
  "Tests that run against the built package import its public entries; import the public entry, or rename the file to `.test.src.ts` to test internals in source mode only.";

export default defineConvention({
  // @debt the check reads the `library` preset; it belongs to the `published` trait once that exists
  presets: ["library"],
  files: ["files.test.public"],
  rule: (config) => {
    const sourceDirs = config.src.dirs.map((dir) => {
      return resolve(config.root, dir);
    });

    const imports = config.packageJson.optional.imports ?? {};

    function resolveSource(
      source: string,
      importer: string,
    ): string | undefined {
      if (source.startsWith(".")) {
        return resolve(dirname(importer), source);
      }

      if (!source.startsWith("#")) {
        return;
      }

      const target = resolveSubpathImport(imports, source);

      if (target !== undefined) {
        return resolve(config.root, target);
      }
    }

    return {
      meta: {
        type: "problem",
        docs: {
          description: message,
        },
        messages: {
          internal: message,
        },
        schema: [],
      },
      create(context) {
        return visitImportSources((node, source) => {
          const path = resolveSource(source, context.filename);

          if (
            path !== undefined &&
            sourceDirs.some((dir) => isWithin(dir, path))
          ) {
            context.report({
              node,
              messageId: "internal",
            });
          }
        });
      },
    };
  },
});
