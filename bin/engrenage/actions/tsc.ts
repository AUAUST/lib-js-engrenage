import { resolveTscArguments } from "#tools/typescript/index";
import { getRunContext } from "#workflows/cli/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (args: string[]): Promise<readonly string[]> {
  const { reporter } = getRunContext();

  const resolved = await resolveTscArguments(
    await loadValidatedConfig(undefined, { reporter }),
    args,
  );

  if (resolved.skipped.length > 0) {
    reporter.info(`Not type-checked: ${resolved.skipped.join(", ")}`);
  }

  return resolved.args;
}
