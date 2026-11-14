import {
  shopifyPrettierPluginLiquid,
  themeLayoutGlob,
} from "#tools/shopify/theme/constants";
import type { Extension, FileLocation } from "#project/config/index";

/**
 * Active when `@shopify/prettier-plugin-liquid` is installed; owns Vite's theme
 * assets when a theme layout exists, formats `.liquid` files and contributes the
 * `shopify-theme` preset.
 */
export default {
  name: "tools/shopify/theme",
  when: {
    installed: shopifyPrettierPluginLiquid,
  },
  owns: {
    files: {
      "shopify.theme.vite": {
        title: "Vite",
        committed: false,
        async locate(config): Promise<FileLocation | undefined> {
          const layouts = await config.context.filesystem.glob(themeLayoutGlob);

          if (layouts.length === 0) {
            return;
          }

          return { globs: ["assets/d-*", "assets/.vite/**"] };
        },
      },
    },
  },
  contributes: {
    "prettier.plugins": [
      {
        name: shopifyPrettierPluginLiquid,
        files: ["*.liquid"],
        async load() {
          const {
            liquidPlugin,
          } = await import("#tools/shopify/theme/adapters/liquidPlugin");

          return liquidPlugin;
        },
      },
    ],
    "presets": [
      {
        name: "shopify-theme",
        traits: [],
      },
    ],
  },
} satisfies Extension;

declare global {
  namespace Engrenage {
    interface Presets {
      "shopify-theme": true;
    }
  }
}
