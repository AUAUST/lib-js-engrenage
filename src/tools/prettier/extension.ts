import type { Extension } from "#project/config/index";

export default {
  name: "tools/prettier",
  owns: {
    keys: {
      prettier: {
        input: "prettier",
        async load() {
          const { prettierSection } =
            await import("#tools/prettier/config/sections/prettierSection");

          return prettierSection;
        },
      },
    },
  },
} satisfies Extension;
