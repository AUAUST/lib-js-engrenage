import { format } from "prettier";
import { parsers } from "prettier/plugins/typescript";
import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
import type { Config } from "#tools/prettier/types/Config";

async function formatWith(source: string, options?: Config): Promise<string> {
  const project = createTemporaryProject({
    "package.json": '{ "type": "module" }',
    "engrenage.config.ts": "export default {};\n",
  });

  const config = await createPrettierConfig(
    await loadConfig(project.root),
    options,
  );

  return format(source, {
    ...config,
    parser: "typescript",
  });
}

describe("layoutPlugin", () => {
  test("pads a declaration Prettier wraps past the print width, and formats its output unchanged", async () => {
    const source = `const before = 1;
const wrapped = [firstArgumentValue, secondArgumentValue, thirdArgumentValue, fourth];
const after = 2;
`;

    const output = await formatWith(source);

    expect(output).toBe(`const before = 1;

const wrapped = [
  firstArgumentValue,
  secondArgumentValue,
  thirdArgumentValue,
  fourth,
];

const after = 2;
`);

    expect(await formatWith(output)).toBe(output);
  });

  test("keeps the preprocess of a plugin overriding the same parser", async () => {
    const renaming = {
      parsers: {
        typescript: {
          ...parsers.typescript,
          preprocess(text: string) {
            return text.replaceAll("original", "renamed");
          },
        },
      },
    };

    const output = await formatWith(
      "const original = {\n  value: 1,\n};\nconst after = original;\n",
      { plugins: [renaming] },
    );

    expect(output).toBe(
      "const renamed = {\n  value: 1,\n};\n\nconst after = renamed;\n",
    );
  });

  test("leaves a prettier-ignore statement without edits", async () => {
    const source = `const before = 1;
// prettier-ignore
const ignored = { a: 1, b: 2, c: 3 };
// prettier-ignore
const kept = [
  1, 2,
];
`;

    expect(await formatWith(source)).toBe(source);
  });

  test.each([
    [
      "one property",
      "getLinter({ typeAware: false })",
      "getLinter({ typeAware: false })",
    ],
    [
      "two properties",
      "{ first: true, second: false }",
      "{ first: true, second: false }",
    ],
    [
      "existing newlines",
      "{\n typeAware: false,\n}",
      "{\n  typeAware: false,\n}",
    ],
    [
      "three properties",
      "{ first: true, second: false, third: true }",
      "{\n  first: true,\n  second: false,\n  third: true,\n}",
    ],
    [
      "nested objects",
      "{ value: { nested: true } }",
      "{\n  value: { nested: true },\n}",
    ],
    [
      "inline arguments",
      "await run({ first: true }, { second: false })",
      "await run({ first: true }, { second: false })",
    ],
    [
      "multiline arguments",
      "await run({ presets: [] }, {\n performance: { noZodClassic: true },\n})",
      "await run(\n  {\n    presets: [],\n  },\n  {\n    performance: { noZodClassic: true },\n  },\n)",
    ],
    [
      "three-property sibling",
      "[{ short: true }, { a: 1, b: 2, c: 3 }]",
      "[\n  {\n    short: true,\n  },\n  {\n    a: 1,\n    b: 2,\n    c: 3,\n  },\n]",
    ],
    [
      "nested arrays",
      "[[{ short: true }, true], [{\n other: false,\n}, false]]",
      "[\n  [\n    {\n      short: true,\n    },\n    true,\n  ],\n  [\n    {\n      other: false,\n    },\n    false,\n  ],\n]",
    ],
    [
      "constructor arguments",
      "new Config({ first: true }, {\n second: false,\n})",
      "new Config(\n  {\n    first: true,\n  },\n  {\n    second: false,\n  },\n)",
    ],
    [
      "unrelated calls",
      "[first({ short: true }), second({\n other: false,\n})]",
      "[\n  first({ short: true }),\n  second({\n    other: false,\n  }),\n]",
    ],
    [
      "multiline property value siblings",
      "{\n short: { a: 1 },\n long: { b: 1, c: 2, d: 3 },\n}",
      "{\n  short: {\n    a: 1,\n  },\n  long: {\n    b: 1,\n    c: 2,\n    d: 3,\n  },\n}",
    ],
    [
      "inline property value siblings",
      "{\n first: { a: 1 },\n second: { b: 2 },\n}",
      "{\n  first: { a: 1 },\n  second: { b: 2 },\n}",
    ],
    [
      "empty objects",
      "await run({}, {\n enabled: true,\n})",
      "await run(\n  {},\n  {\n    enabled: true,\n  },\n)",
    ],
    [
      "Prettier wrapping",
      'await run({ short: true }, { longProperty: "a deliberately long value that forces the object to wrap beyond the configured print width" })',
      'await run(\n  {\n    short: true,\n  },\n  {\n    longProperty:\n      "a deliberately long value that forces the object to wrap beyond the configured print width",\n  },\n)',
    ],
  ])("breaks object braces with %s", async (_name, input, output) => {
    const formatted = await formatWith(`export const result = ${input};\n`);

    expect(formatted).toBe(`export const result = ${output};\n`);

    expect(await formatWith(formatted)).toBe(formatted);
  });

  test("pads cases once a case body spans several lines or a case is padded", async () => {
    const output = await formatWith(`export function inline(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }
    default: {
      return 2;
    }
  }
}

export function multiline(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }
    default: {
      const doubled = value + value;

      return doubled.length;
    }
  }
}

export function partlyPadded(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }

    case "b": {
      return 2;
    }
    default: {
      return 3;
    }
  }
}
`);

    expect(output).toBe(`export function inline(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }
    default: {
      return 2;
    }
  }
}

export function multiline(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }

    default: {
      const doubled = value + value;

      return doubled.length;
    }
  }
}

export function partlyPadded(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }

    case "b": {
      return 2;
    }

    default: {
      return 3;
    }
  }
}
`);
  });
});
