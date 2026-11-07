import { flat } from "@auaust/primitive-kit/arrays";

import { packageJsonFile } from "#constants";
import { spawnProcess } from "#foundation/processes/operations/spawnProcess";
import { packageJsonPathSection } from "#project/package/index";
import { createPrompter } from "#workflows/cli/operations/createPrompter";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { listFilesystems } from "#workflows/cli/operations/listFilesystems";
import { reportSyncResults } from "#workflows/cli/operations/reportSyncResults";
import { runSteps } from "#workflows/cli/operations/runSteps";
import { settleChanges } from "#workflows/cli/operations/settleChanges";
import { listInitSteps } from "#workflows/init/operations/listInitSteps";
import { readConfig } from "#workflows/registry/operations/readConfig";
import { runSync } from "#workflows/sync/index";
import type { LoadedConfig } from "#project/config/index";
import type { Invocation } from "#project/steps/types/Invocation";
import type { Prompter } from "#project/steps/types/Prompter";
import type { Directory } from "#types/Directory";

function describe({ command, args }: Invocation): string {
  return [command, ...args].join(" ");
}

async function invokeCommand(root: Directory, invocation: Invocation) {
  const { status, error } = await spawnProcess(
    invocation.command,
    invocation.args,
    {
      cwd: root,
      stdio: "inherit",
    },
  );

  if (error !== undefined) {
    throw new Error(`Cannot run ${describe(invocation)}`, {
      cause: error,
    });
  }

  if (status !== 0) {
    throw new Error(
      `${describe(invocation)} exited with code ${status}: fix the error above, then run engrenage init again`,
    );
  }
}

async function readPackage(
  prompter: Prompter,
): Promise<LoadedConfig | undefined> {
  const config = await readConfig(process.cwd(), {
    searchParents: false,
  });

  if ((await config.resolve(packageJsonPathSection)) !== undefined) {
    return config;
  }

  const starts = await prompter.confirm(
    `No ${packageJsonFile} in ${config.context.root}. Start a new package here?`,
  );

  if (!starts) {
    return;
  }

  // @debt hand-written pnpm invocation, like those in createStepContext and createChangesetConfigStep
  await invokeCommand(config.context.root, {
    command: "pnpm",
    args: ["init", "--bare"],
    interactive: false,
  });

  return readConfig(config.context.root, {
    searchParents: false,
  });
}

export const init = defineCommand((command) => {
  return command
    .option("-y, --yes", "accept every step without asking", false)
    .action(async ({ yes }) => {
      const prompter = createPrompter({
        yes,
      });

      const config = await readPackage(prompter);

      if (config === undefined) {
        return;
      }

      const invocations = await runSteps({
        config,
        prompter,
        steps: listInitSteps(),
      });

      if (invocations === undefined) {
        return;
      }

      const filesystems = await listFilesystems(config);

      await Promise.all(filesystems.map((filesystem) => filesystem.format()));

      reportSyncResults(
        flat(
          await Promise.all(
            filesystems.map((filesystem) => filesystem.flush()),
          ),
        ),
      );

      for (const invocation of invocations) {
        if (yes && invocation.interactive) {
          console.info(`Run ${describe(invocation)} to finish the setup.`);
        } else {
          await invokeCommand(config.context.root, invocation);
        }
      }

      const installed = await readConfig(config.context.root, {
        searchParents: false,
      });

      await runSync(installed);

      await settleChanges(installed, {
        check: false,
      });
    });
});
