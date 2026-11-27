import {
  getRunContext,
  option,
  type OptionDeclaration,
} from "#nexus/cli/index";
import { listSyncOptions } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (): Promise<readonly OptionDeclaration[]> {
  const { options } = await listSyncOptions(
    await loadValidatedConfig(undefined, {
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
