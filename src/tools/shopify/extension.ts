import {
  appConfigGlob,
  directoryPlaceholder,
  extensionsGlob,
  shopifyCli,
} from "#tools/shopify/constants";
import type { Extension, FileLocation } from "#project/config/index";

import theme from "#tools/shopify/theme/extension";

export default [
  {
    name: "tools/shopify",
    when: {
      installed: shopifyCli,
    },
    owns: {
      files: {
        "shopify.app": {
          title: "Shopify",
          formatted: false,
          async locate(config): Promise<FileLocation | undefined> {
            const appConfigs =
              await config.context.filesystem.glob(appConfigGlob);

            if (appConfigs.length === 0) {
              return;
            }

            return {
              globs: [
                appConfigGlob,
                "shopify.web.toml",
                `${extensionsGlob}/shopify.extension.toml`,
                `${extensionsGlob}/locales/**`,
              ],
            };
          },
        },
      },
    },
    contributes: {
      presets: [
        {
          name: "shopify-app",
          traits: [],
          load() {
            return Promise.resolve({
              [`workspaces.${extensionsGlob}.name`]: directoryPlaceholder,
              [`workspaces.${extensionsGlob}.generated`]: [
                "dist/**",
                "generated/**",
                "schema.graphql",
              ],
              [`workspaces.${extensionsGlob}.tsconfig.types`]: [
                "@shopify/polaris-types",
              ],
              [`workspaces.${extensionsGlob}.tsconfig.compilerOptions.jsx`]:
                "react-jsx",
              [`workspaces.${extensionsGlob}.tsconfig.compilerOptions.jsxImportSource`]:
                "preact",
            });
          },
        },
      ],
    },
  },
  theme,
] satisfies readonly Extension[];

declare global {
  interface EngrenagePresets {
    "shopify-app": true;
  }
}
