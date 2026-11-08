import { resolveJscpdArguments } from "#tools/jscpd/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (args: string[]): Promise<readonly string[]> {
  return resolveJscpdArguments(await loadValidatedConfig(), args);
}
