import type { LoadedConfig } from "#project/config/index";

export async function listTsconfigEnvironments(
  config: LoadedConfig,
): Promise<readonly string[]> {
  const environments = await config.resolve("environments");

  return environments
    .filter(({ tsconfig }) => tsconfig === true)
    .map(({ name }) => name);
}
