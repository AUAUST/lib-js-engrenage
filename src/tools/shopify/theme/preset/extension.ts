import {
  liquidEnvironmentPreset,
  liquidLanguage,
  liquidThemeKind,
  themeLayoutGlob,
  themeNamespaces,
} from "#tools/shopify/theme/preset/constants";
import type {
  Extension,
  FileLocation,
  KeyDeclaration,
} from "#project/config/index";

type ThemeNamespace = (typeof themeNamespaces)[number]["name"];

function declareNamespaceKey(name: ThemeNamespace): KeyDeclaration {
  return {
    async load() {
      const {
        createNamespaceSection,
      } = await import("#tools/shopify/theme/preset/operations/createNamespaceSection");

      return createNamespaceSection(name);
    },
  };
}

function declareNamespaceOptionsKey(name: ThemeNamespace): KeyDeclaration {
  return {
    async load() {
      const {
        createNamespaceOptionsSection,
      } = await import("#tools/shopify/theme/preset/operations/createNamespaceOptionsSection");

      return createNamespaceOptionsSection(name);
    },
  };
}

/**
 * Active in each scope selecting the `shopify-theme` preset; declares the theme's
 * top-level namespaces, owning the config keys of each, with the `liquid-theme`
 * namespace kind and environment preset and the `liquid` language, and owns
 * Vite's theme assets when the scope holds a theme layout.
 */
export default {
  name: "tools/shopify/theme/preset",
  when: {
    preset: "shopify-theme",
  },
  owns: {
    // @debt the keys repeat the names `themeNamespaces` holds, since keys built from it type as a string record and erase every config key's section type
    keys: {
      "layout": declareNamespaceKey("layout"),
      "layout.options": declareNamespaceOptionsKey("layout"),
      "templates": declareNamespaceKey("templates"),
      "templates.options": declareNamespaceOptionsKey("templates"),
      "sections": declareNamespaceKey("sections"),
      "sections.options": declareNamespaceOptionsKey("sections"),
      "snippets": declareNamespaceKey("snippets"),
      "snippets.options": declareNamespaceOptionsKey("snippets"),
      "blocks": declareNamespaceKey("blocks"),
      "blocks.options": declareNamespaceOptionsKey("blocks"),
      "locales": declareNamespaceKey("locales"),
      "locales.options": declareNamespaceOptionsKey("locales"),
      "config": declareNamespaceKey("config"),
      "config.options": declareNamespaceOptionsKey("config"),
      "assets": declareNamespaceKey("assets"),
      "assets.options": declareNamespaceOptionsKey("assets"),
    },
    files: {
      "shopify.theme.vite": {
        title: "Vite",
        committed: false,
        scope: "scoped",
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
    namespaceKinds: [liquidThemeKind],
    environmentPresets: [liquidEnvironmentPreset],
    environments: themeNamespaces.map(({ name, title, preset }) => {
      return {
        name,
        title,
        preset,
      };
    }),
    languages: [liquidLanguage],
  },
} satisfies Extension;
