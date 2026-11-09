import type { Extension } from "#project/config/index";

export default {
  name: "project/format",
  owns: {
    keys: {
      format: {
        input: "format",
        async load() {
          const { formatSection } =
            await import("#project/format/config/sections/formatSection");

          return formatSection;
        },
      },
    },
  },
} satisfies Extension;
