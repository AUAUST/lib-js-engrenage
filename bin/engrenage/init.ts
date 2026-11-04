import { runSync } from "#bin/engrenage/sync";
import { packageJsonFile } from "#constants";
import { spawnProcess } from "#foundation/processes/operations/spawnProcess";
import { readConfig } from "#project/config/operations/readConfig";
import { createPrompter } from "#workflows/cli/operations/createPrompter";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { reportSyncResults } from "#workflows/cli/operations/reportSyncResults";
import { runSteps } from "#workflows/cli/operations/runSteps";
import { settleChanges } from "#workflows/cli/operations/settleChanges";
import { listInitSteps } from "#workflows/init/operations/listInitSteps";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { Directory } from "#types/Directory";
import type { Invocation } from "#workflows/cli/types/Invocation";
import type { Prompter } from "#workflows/cli/types/Prompter";

function describe({ command, args }: Invocation): string {
  return [command, ...args].join(" ");
}

function invokeCommand(root: Directory, invocation: Invocation) {
  const { status, error } = spawnProcess(invocation.command, invocation.args, {
    cwd: root,
    stdio: "inherit",
  });

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
): Promise<ResolvedConfig | undefined> {
  const config = await readConfig(process.cwd(), {
    searchParents: false,
  });

  if (config.packageJsonPath !== undefined) {
    return config;
  }

  const starts = await prompter.confirm(
    `No ${packageJsonFile} in ${config.root}. Start a new package here?`,
  );

  if (!starts) {
    return;
  }

  // @debt hand-written pnpm invocation, like those in createStepContext and createChangesetConfigStep
  invokeCommand(config.root, {
    command: "pnpm",
    args: ["init", "--bare"],
    interactive: false,
  });

  return readConfig(config.root, {
    searchParents: false,
  });
}

export const init = defineCommand((command) => {
  return command
    .description(
      "Set up engrenage in the project, or add the pieces it is missing.",
    )
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

      await config.filesystem.format();

      reportSyncResults(config.filesystem.flush());

      for (const invocation of invocations) {
        if (yes && invocation.interactive) {
          console.info(`Run ${describe(invocation)} to finish the setup.`);
        } else {
          invokeCommand(config.root, invocation);
        }
      }

      const installed = await readConfig(config.root, {
        searchParents: false,
      });

      await runSync(installed);

      await settleChanges(installed, {
        check: false,
      });
    });
});
