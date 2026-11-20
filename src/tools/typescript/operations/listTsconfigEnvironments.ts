import type { ConfigResolver } from "#project/config/index";

export async function listTsconfigEnvironments(
  config: ConfigResolver,
): Promise<readonly string[]> {
  const environments = await config.resolve("environments");

  return environments
    .filter(({ kind }) => kind.tsconfig === true)
    .map(({ entry }) => entry.name);
}
