import { formatterEntry } from "#project/format/constants";
import type { Extension } from "#project/config/index";

export default {
  name: "project/format",
  owns: {
    slots: {
      "format.formatters": { cardinality: "one", entry: formatterEntry },
    },
    keys: {
      "format": {
        input: "format",
        async load() {
          const {
            formatSection,
          } = await import("#project/format/config/sections/formatSection");

          return formatSection;
        },
      },
      "format.formatter": {
        input: "format",
        async load() {
          const {
            formatterSection,
          } = await import("#project/format/config/sections/formatterSection");

          return formatterSection;
        },
      },
    },
  },
} satisfies Extension;
