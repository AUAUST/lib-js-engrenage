import type { CommandUnknownOpts } from "@commander-js/extra-typings";

import { listSyncOptions } from "#project/sync/index";
import { loadValidatedConfig } from "#workflows/config/index";

export default async function (command: CommandUnknownOpts): Promise<void> {
  const argument = command.registeredArguments.find((candidate) => {
    return candidate.name() === "targets";
  });

  if (argument === undefined) {
    throw new Error(`The ${command.name()} command has no targets argument`);
  }

  const {
    targets,
    options,
  } = await listSyncOptions(await loadValidatedConfig());

  argument.choices(targets);

  for (const { option } of options) {
    command.addOption(option);
  }
}
