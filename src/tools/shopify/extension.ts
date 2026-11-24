import {
  appConfigGlob,
  directoryPlaceholder,
  extensionsGlob,
  shopifyCli,
} from "#tools/shopify/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Active when `@shopify/cli` is installed; owns the app's TOML and extension
 * locale files when an app config exists, and contributes the `shopify-app`
 * preset configuring extension workspaces.
 */
export default {
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
          const appConfigs = await config.context.filesystem.glob(
            appConfigGlob,
          );

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
          });
        },
      },
    ],
  },
} satisfies Extension;

declare global {
  namespace Engrenage {
    interface Presets {
      "shopify-app": true;
    }
  }
}
