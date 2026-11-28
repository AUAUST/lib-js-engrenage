import {
  getRunContext,
  option,
  type OptionDeclaration,
} from "#nexus/cli/index";
import { listSyncOptions } from "#project/sync/index";
import { loadConfig } from "#workflows/config/index";

export default async function (): Promise<readonly OptionDeclaration[]> {
  const { options } = await listSyncOptions(
    await loadConfig(undefined, {
      reporter: getRunContext().reporter,
    }),
  );

  return options.map(({ name, description }) => {
    return option({
      name,
      type: "boolean",
      description,
    });
  });
}
