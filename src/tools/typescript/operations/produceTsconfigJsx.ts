import { map } from "@auaust/toolkit/array";

import { validate } from "#foundation/options/index";
import { readEnvironmentLanguages } from "#project/environments/index";
import { listImportableEnvironments } from "#project/structure/index";
import { typescriptOptionsSchema } from "#tools/typescript/config/schemas/typescriptOptionsSchema";
import { jsxFlavours, typescript } from "#tools/typescript/constants";
import { toTsconfigEnvironment } from "#tools/typescript/utils/toTsconfigEnvironment";
import type { JsonEdit } from "#foundation/json/index";
import type { ConfigResolver, LoadedConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/index";

type JsxFlavour = keyof typeof jsxFlavours;

async function readJsxFlavour(
  config: ConfigResolver,
  environment: string,
): Promise<JsxFlavour | undefined> {
  const languages = await readEnvironmentLanguages(config, environment);

  const language = languages.find(({ name }) => name === typescript);

  const { tsx } = validate(
    typescriptOptionsSchema,
    language?.options ?? {},
    "TypeScript language options",
  );

  return tsx;
}

/**
 * Resolves the one JSX flavour the program of `environment` checks its own
 * modules and those it may import under.
 *
 * @throws When the environments it may import set different flavours, which one
 * program cannot check together.
 */
async function resolveJsxFlavour(
  config: ConfigResolver,
  environment: string,
): Promise<JsxFlavour | undefined> {
  const importable = await listImportableEnvironments(config, environment);

  const flavours = await Promise.all(
    map(importable, async (name) => {
      return [name, await readJsxFlavour(config, name)] as const;
    }),
  );

  const set = flavours.filter(
    (entry): entry is readonly [string, JsxFlavour] => entry[1] !== undefined,
  );

  const distinct = new Set(map(set, ([, flavour]) => flavour));

  if (distinct.size > 1) {
    const listed = map(set, ([name, flavour]) => `${name}: ${flavour}`);

    throw new Error(
      `The ${environment} environment may import modules of environments setting different JSX flavours (${listed.join(", ")}), which one tsconfig cannot check together`,
    );
  }

  return set[0]?.[1];
}

export async function produceTsconfigJsx(
  config: LoadedConfig,
  { key, scope }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key === "base") {
    return [];
  }

  const tsx = await resolveJsxFlavour(
    await config.context.scope(scope),
    toTsconfigEnvironment(key),
  );

  const { jsx, jsxImportSource } = tsx === undefined
    ? { jsx: undefined, jsxImportSource: undefined }
    : jsxFlavours[tsx];

  return [
    { path: ["compilerOptions", "jsx"], value: jsx },
    { path: ["compilerOptions", "jsxImportSource"], value: jsxImportSource },
  ];
}
