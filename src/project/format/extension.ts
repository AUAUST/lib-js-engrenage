import { formatterEntry } from "#project/format/constants";
import type { Extension } from "#project/config/index";

/**
 * Owns the `format` and `format.formatter` keys and the `format.formatters` slot,
 * which takes one active formatter.
 */
export default {
  name: "project/format",
  owns: {
    slots: {
      "format.formatters": {
        cardinality: "one",
        entry: formatterEntry,
      },
    },
    keys: {
      "format": {
        input: "format",
        load() {
          return import("#project/format/config/sections/formatSection");
        },
      },
      "format.formatter": {
        input: "format",
        load() {
          return import("#project/format/config/sections/formatterSection");
        },
      },
    },
  },
} satisfies Extension;
