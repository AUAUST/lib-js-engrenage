import { boolean, integer, minValue, number, picklist, pipe } from "valibot";

import { declare, declareObject, unset } from "#foundation/options/index";
import { formatterNameSchema } from "#project/format/config/schemas/formatterNameSchema";
import { complexityLimits, conventions } from "#project/format/constants";

export const formatSchema = declareObject(
  {
    formatter: declare(formatterNameSchema, {
      description: [
        "Formatter of the files engrenage writes, among those its extensions contribute (`prettier`).",
        "`false` writes them unformatted.",
      ],
      optional: unset(
        "the only active formatter, none when no formatter is active; resolving it fails when several are",
      ),
      disable: { value: false },
    }),
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
    // @debt complexity limits are not formatting conventions; consider a broader section on how code is written, covering formatting primitives, complexity constraints and the other rules that shape the look and feel of code
    maxCognitiveComplexity: declare(pipe(number(), integer(), minValue(0)), {
      description: "Highest cognitive complexity a function may reach, as SonarSource defines it.",
      optional: { value: complexityLimits.cognitiveComplexity },
    }),
    maxFunctionLines: declare(pipe(number(), integer(), minValue(1)), {
      description: "Most lines a function may span, blank lines and comments excluded.",
      optional: { value: complexityLimits.functionLines },
    }),
    maxFileLines: declare(pipe(number(), integer(), minValue(1)), {
      description: "Most lines a module may span, blank lines and comments excluded.",
      optional: { value: complexityLimits.fileLines },
    }),
  },
  {
    description: "Formatting conventions and complexity limits of the project, mapped by each formatter or linter at its boundary (Prettier options, ESLint rules, and conventions no tool covers).",
    optional: true,
  },
);
