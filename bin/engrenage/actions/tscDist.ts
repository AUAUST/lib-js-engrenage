import { resolveTscDistArguments } from "#tools/typescript/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (args: string[]): Promise<readonly string[]> {
  return resolveTscDistArguments(await loadValidatedConfig(), args);
}
