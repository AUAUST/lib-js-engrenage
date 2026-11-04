import { defineConvention } from "#eslint/utils/defineConvention";
import { visitImportSources } from "#eslint/utils/visitImportSources";

const message =
  "Source-only tests import internals through `#…` aliases; never the package name, or rename the file to `.test.ts` to test the built package.";

export default defineConvention({
  // @debt the check reads the `library` preset; it belongs to the `published` trait once that exists
  presets: ["library"],
  files: ["files.test.src"],
  rule: (config) => {
    const packageName = config.packageJson.optional.name;

    return {
      meta: {
        type: "problem",
        docs: {
          description: message,
        },
        messages: {
          packageName: message,
        },
        schema: [],
      },
      create(context) {
        if (packageName === undefined) {
          return {};
        }

        return visitImportSources((node, source) => {
          if (source === packageName || source.startsWith(`${packageName}/`)) {
            context.report({
              node,
              messageId: "packageName",
            });
          }
        });
      },
    };
  },
});
