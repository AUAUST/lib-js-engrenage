import type { ConfigResolver } from "#project/config/index";

export async function listTsconfigEnvironments(
  config: ConfigResolver,
): Promise<readonly string[]> {
  const environments = await config.resolve("environments");

  return environments
    .filter(({ tsconfig }) => tsconfig === true)
    .map(({ name }) => name);
}
