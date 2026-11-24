import { shopifyPrettierPluginLiquid } from "#tools/shopify/theme/constants";
import type { Extension } from "#project/config/index";

/**
 * Active when `@shopify/prettier-plugin-liquid` is installed; formats
 * `.liquid` files and contributes the `shopify-theme` preset, whose structure
 * `tools/shopify/theme/preset` applies in each scope selecting it.
 */
export default {
  name: "tools/shopify/theme",
  when: {
    installed: shopifyPrettierPluginLiquid,
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
