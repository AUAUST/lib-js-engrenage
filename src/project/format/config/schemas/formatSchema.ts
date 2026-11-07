import { boolean, number, picklist } from "valibot";

import { declare, declareObject } from "#foundation/options/index";
import { conventions } from "#project/format/constants";

export const formatSchema = declareObject(
  {
    indent: declare(picklist(["spaces", "tabs"]), {
      description: "Whether indentation uses spaces or tabs.",
      optional: { value: conventions.indent },
    }),
    indentWidth: declare(number(), {
      description: "Width of one indentation level, in columns.",
      optional: { value: conventions.indentWidth },
    }),
    lineWidth: declare(number(), {
      description: "Line width the formatter wraps at, in columns.",
      optional: { value: conventions.lineWidth },
    }),
    quotes: declare(picklist(["double", "single"]), {
      description: "Quotes of string literals.",
      optional: { value: conventions.quotes },
    }),
    semicolons: declare(boolean(), {
      description: "Whether statements end with a semicolon.",
      optional: { value: conventions.semicolons },
    }),
    trailingCommas: declare(picklist(["all", "es5", "none"]), {
      description: "Where multiline lists get a trailing comma.",
      optional: { value: conventions.trailingCommas },
    }),
    endOfLine: declare(picklist(["lf", "crlf"]), {
      description: "Line ending of formatted files.",
      optional: { value: conventions.endOfLine },
    }),
  },
  {
    description:
      "Formatting conventions of the project, mapped by each formatter at its boundary (Prettier options, and conventions no formatter covers).",
    optional: true,
  },
);
