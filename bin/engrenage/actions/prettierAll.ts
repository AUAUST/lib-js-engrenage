import { resolvePrettierAllArguments } from "#tools/prettier/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (args: string[]): Promise<readonly string[]> {
  return resolvePrettierAllArguments(await loadValidatedConfig(), args);
}
