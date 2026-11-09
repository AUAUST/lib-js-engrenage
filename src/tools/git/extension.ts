import type { Extension } from "#project/config/index";

export default {
  name: "tools/git",
  owns: {
    keys: {
      git: {
        input: "git",
        async load() {
          const { gitSection } =
            await import("#tools/git/config/sections/gitSection");

          return gitSection;
        },
      },
    },
  },
} satisfies Extension;
