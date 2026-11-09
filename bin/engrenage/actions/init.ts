import { flat } from "@auaust/primitive-kit/arrays";

import { packageJsonFile } from "#constants";
import { runProcess } from "#foundation/processes/index";
import { loadConfig, type LoadedConfig } from "#project/config/index";
import { createPnpmInvocation } from "#tools/pnpm/index";
import { loadValidatedConfig } from "#workflows/config/index";
import { createPrompter, listInitSteps, runSteps } from "#workflows/init/index";
import {
  formatChanges,
  reportSyncResults,
  runSync,
  settleChanges,
} from "#workflows/sync/index";
import type { Invocation, Prompter } from "#project/steps/index";
import type { Directory } from "#types/Directory";

function describe({ command, args }: Invocation): string {
  return [command, ...args].join(" ");
}

async function invokeCommand(root: Directory, invocation: Invocation) {
  try {
    await runProcess(invocation.command, invocation.args, {
      cwd: root,
      stdio: "inherit",
    });
  } catch (error) {
    throw new Error("Fix the error above, then run engrenage init again", {
      cause: error,
    });
  }
}

async function readPackage(
  prompter: Prompter,
): Promise<LoadedConfig | undefined> {
  const config = await loadValidatedConfig(process.cwd(), {
    searchParents: false,
  });

  if ((await config.resolve("packageJsonPath")) !== undefined) {
    return config;
  }

  const starts = await prompter.confirm(
    `No ${packageJsonFile} in ${config.context.root}. Start a new package here?`,
  );

  if (!starts) {
    return;
  }

  await invokeCommand(
    config.context.root,
    createPnpmInvocation(["init", "--bare"]),
  );

  loadConfig.refresh(config.context.root);

  return loadValidatedConfig(config.context.root, {
    searchParents: false,
  });
}

export default async function ({ yes }: { yes: boolean }): Promise<void> {
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

  const filesystems = await formatChanges(config);

  reportSyncResults(
    flat(
      await Promise.all(filesystems.map((filesystem) => filesystem.flush())),
    ),
  );

  for (const invocation of invocations) {
    if (yes && invocation.interactive) {
      console.info(`Run ${describe(invocation)} to finish the setup.`);
    } else {
      await invokeCommand(config.context.root, invocation);
    }
  }

  loadConfig.refresh(config.context.root);

  const installed = await loadValidatedConfig(config.context.root, {
    searchParents: false,
  });

  await runSync(installed);

  await settleChanges(installed, {
    check: false,
  });
}
