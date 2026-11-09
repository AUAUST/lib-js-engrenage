import type { Extension } from "#project/config/types/Extension";

export default {
  name: "project/config",
  owns: {
    keys: {
      extensions: {
        input: "extensions",
        async load() {
          const { extensionsSection } =
            await import("#project/config/config/sections/extensionsSection");

          return extensionsSection;
        },
      },
    },
  },
} satisfies Extension;
