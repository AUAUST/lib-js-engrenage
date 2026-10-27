import { Argument, Option } from "@commander-js/extra-typings";
import { boolean, optional } from "valibot";

import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries, keys } from "@auaust/toolkit/object";

import { syncAgentFiles } from "#agents/setup/syncAgentFiles";
import { syncClaudeSettings } from "#agents/setup/syncClaudeSettings";
import { syncChangesetConfig } from "#changesets/setup/syncChangesetConfig";
import { loadConfig } from "#config/utils/loadConfig";
import { syncGitignoreFile } from "#git/setup/syncGitignoreFile";
import { syncWorkflowFiles } from "#github/setup/syncWorkflowFiles";
import { syncPrettierignoreFile } from "#prettier/setup/syncPrettierignoreFile";
import { defineCommand } from "#support/commander/utils/defineCommand";
import { settleChanges } from "#support/commander/utils/settleChanges";
import { syncEnvFile } from "#typescript/setup/syncEnvFile";
import { validate } from "#utils/validate";
import { syncVscodeFiles } from "#vscode/setup/syncVscodeFiles";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

interface SyncTarget<Flag extends string> {
  sync: (config: ResolvedConfig, flags: Partial<Record<Flag, boolean>>) => void;
  flags?: Record<Flag, string>;
}

function defineTarget<Flag extends string = never>(
  sync: SyncTarget<Flag>["sync"],
  flags?: Record<Flag, string>,
): SyncTarget<Flag> {
  return {
    sync,
    flags,
  };
}

const targets = {
  agents: defineTarget(syncAgentFiles),
  changesets: defineTarget(syncChangesetConfig),
  claude: defineTarget(syncClaudeSettings, {
    settings: "create .claude/settings.json when it is missing",
  }),
  gitignore: defineTarget(syncGitignoreFile),
  globals: defineTarget(syncEnvFile),
  prettierignore: defineTarget(syncPrettierignoreFile),
  vscode: defineTarget(syncVscodeFiles, {
    settings: "create .vscode/settings.json when it is missing",
    extensions: "create .vscode/extensions.json when it is missing",
  }),
  workflows: defineTarget(syncWorkflowFiles),
};

type TargetName = keyof typeof targets;

type TargetFlags = Partial<Record<TargetName, Record<string, boolean>>>;

function createFlagOptions(): ReadonlyArray<{
  target: TargetName;
  flag: string;
  option: Option;
}> {
  return flatMap(entries(targets), ([target, { flags = {} }]) => {
    return map(
      entries<Record<string, string>>(flags),
      ([flag, description]) => {
        return {
          target,
          flag,
          option: new Option(`--${target}-${flag}`, description),
        };
      },
    );
  });
}

export function runSync(
  config: ResolvedConfig,
  {
    names = keys(targets),
    flags = {},
  }: {
    names?: ReadonlyArray<TargetName>;
    flags?: TargetFlags;
  } = {},
) {
  for (const name of names) {
    targets[name].sync(config, flags[name] ?? {});
  }
}

export const sync = defineCommand((command) => {
  const flagOptions = createFlagOptions();

  for (const { option } of flagOptions) {
    command.addOption(option);
  }

  return command
    .description(
      "Update the existing project files that engrenage derives from the config. `engrenage init` creates missing ones.",
    )
    .addArgument(
      new Argument("[targets...]", "targets to sync (all by default)").choices(
        keys(targets),
      ),
    )
    .option("--check", "report outdated files without writing them", false)
    .action(async (selected, { check }, self) => {
      const config = await loadConfig();

      const flags: TargetFlags = {};

      for (const { target, flag, option } of flagOptions) {
        const name = option.attributeName();

        const value = validate(
          optional(boolean()),
          self.getOptionValue(name),
          `--${option.name()}`,
        );

        if (value !== undefined) {
          flags[target] = {
            ...flags[target],
            [flag]: value,
          };
        }
      }

      if (check) {
        console.info("Checking synced files...");
      }

      runSync(config, {
        names: selected.length === 0 ? keys(targets) : selected,
        flags,
      });

      settleChanges(config, {
        check,
      });
    });
});
