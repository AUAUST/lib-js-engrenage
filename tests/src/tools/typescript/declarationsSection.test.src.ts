import { picklist } from "valibot";
import { describe, expect, test } from "vitest";

import {
  createProjectConfig,
  type Extension,
  type LoadedConfig,
} from "#project/config/index";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import type { SourceDeclaration, TagDeclaration } from "#project/docs/index";

const relationTags: readonly TagDeclaration[] = [
  {
    name: "relates",
    body: "inline",
    scope: "export",
  },
  {
    name: "native",
    body: "inline",
    schema: picklist(["equal", "similar"]),
  },
];

const fixture = `/**
 * Adds two numbers.
 *
 * @remarks Never overflows.
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Pads a value.
 *
 * @relates specialises string.padStart
 * @stable
 */
export function pad(value: string): string;
/**
 * Pads a value to a length.
 *
 * @experimental
 */
export function pad(value: string, length: number): string;
/**
 * Implementation.
 */
export function pad(value: string, length = 2): string {
  return value.padStart(length);
}

/**
 * Hidden.
 */
function hidden(): void {}

export * from "./other";
`;

function createConfig(
  files: Record<string, string>,
  extension: Partial<Extension> = {},
) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    ...files,
  });

  return createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({
      extensions: [
        {
          name: "relations",
          ...extension,
          contributes: {
            "docs.tags": [
              {
                name: "relations",
                load() {
                  return Promise.resolve(relationTags);
                },
              },
            ],
            ...extension.contributes,
          },
        },
      ],
    }),
    configFile: undefined,
  });
}

describe("declarations section", () => {
  test("reads exported declarations with their tags per signature", async () => {
    const config = createConfig({ "src/fixture.ts": fixture });

    const declarations = await config.resolve("declarations");

    expect(await declarations.of("src/fixture.ts")).toEqual([
      {
        name: "add",
        kind: "function",
        tags: [],
        signatures: [
          {
            description: "Adds two numbers.",
            tags: [{ name: "remarks", value: "Never overflows." }],
          },
        ],
      },
      {
        name: "pad",
        kind: "function",
        tags: [
          {
            name: "relates",
            value: "specialises string.padStart",
          },
        ],
        signatures: [
          {
            description: "Pads a value.",
            tags: [{ name: "stable", value: true }],
          },
          {
            description: "Pads a value to a length.",
            tags: [{ name: "experimental", value: true }],
          },
        ],
      },
    ] satisfies SourceDeclaration[]);
  });

  test("rejects an invalid tag value naming the file and the tag", async () => {
    const config = createConfig({
      "src/invalid.ts": "/**\n * @native unknown\n */\nexport const a = 1;\n",
    });

    const declarations = await config.resolve("declarations");

    await expect(declarations.of("src/invalid.ts")).rejects.toThrow(
      /`src\/invalid\.ts`: `@native`/,
    );
  });

  test("sees the declarations a generate target staged in the same sync", async () => {
    const read: (readonly SourceDeclaration[])[] = [];

    const config = createConfig(
      {
        "tsconfig.json": "{}",
      },
      {
        contributes: {
          "sync.targets": [
            {
              name: "generator",
              stage: "generate",
              load() {
                return Promise.resolve(async (loaded: LoadedConfig) => {
                  await loaded.resolve("declarations");

                  await loaded.context.filesystem.write(
                    "src/generated.ts",
                    "/**\n * Generated.\n */\nexport const generated = 1;\n",
                  );
                });
              },
            },
            {
              name: "reader",
              stage: "write",
              load() {
                return Promise.resolve(async (loaded: LoadedConfig) => {
                  const declarations = await loaded.resolve("declarations");

                  read.push(await declarations.of("src/generated.ts"));
                });
              },
            },
          ],
        },
      },
    );

    await runSync(config, { names: ["generator", "reader"] });

    expect(read).toEqual([
      [
        {
          name: "generated",
          kind: "const",
          tags: [],
          signatures: [{ description: "Generated.", tags: [] }],
        },
      ],
    ]);
  });
});
