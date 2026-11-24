import { validate } from "#foundation/options/index";
import { readEnvironmentLanguages } from "#project/environments/index";
import { typescriptOptionsSchema } from "#tools/typescript/config/schemas/typescriptOptionsSchema";
import { jsxFlavours, typescript } from "#tools/typescript/constants";
import { toTsconfigEnvironment } from "#tools/typescript/utils/toTsconfigEnvironment";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/index";

export async function produceTsconfigJsx(
  config: LoadedConfig,
  { key }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key === "base") {
    return [];
  }

  const languages = await readEnvironmentLanguages(
    config,
    toTsconfigEnvironment(key),
  );

  const language = languages.find(({ name }) => name === typescript);

  const { tsx } = validate(
    typescriptOptionsSchema,
    language?.options ?? {},
    "TypeScript language options",
  );

  const { jsx, jsxImportSource } = tsx === undefined
    ? { jsx: undefined, jsxImportSource: undefined }
    : jsxFlavours[tsx];

  return [
    { path: ["compilerOptions", "jsx"], value: jsx },
    { path: ["compilerOptions", "jsxImportSource"], value: jsxImportSource },
  ];
}
