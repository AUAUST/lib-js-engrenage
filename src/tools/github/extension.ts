import type { Extension } from "#project/config/index";

export default {
  name: "tools/github",
  owns: {
    keys: {
      github: {
        input: "github",
        async load() {
          const { githubSection } =
            await import("#tools/github/config/sections/githubSection");

          return githubSection;
        },
      },
    },
  },
} satisfies Extension;
