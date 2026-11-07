import { Argument, Option } from "@commander-js/extra-typings";
import { boolean, optional } from "valibot";

import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries, keys } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/utils/validate";
import { loadConfig } from "#project/config/operations/loadConfig";
import { defineCommand } from "#workflows/cli/operations/defineCommand";
import { settleChanges } from "#workflows/cli/operations/settleChanges";
import { validateConfig } from "#workflows/registry/operations/validateConfig";
import {
  runSync,
  syncTargets,
  type SyncTargetFlags,
  type SyncTargetName,
} from "#workflows/sync/index";

function createFlagOptions(): readonly {
  target: SyncTargetName;
  flag: string;
  option: Option;
}[] {
  return flatMap(entries(syncTargets), ([target, { flags }]) => {
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

export const sync = defineCommand((command) => {
  const flagOptions = createFlagOptions();

  for (const { option } of flagOptions) {
    command.addOption(option);
  }

  return command
    .addArgument(
      new Argument("[targets...]", "targets to sync (all by default)").choices(
        keys(syncTargets),
      ),
    )
    .option("--check", "report outdated files without writing them", false)
    .action(async (selected, { check }, self) => {
      const config = validateConfig(await loadConfig());

      const flags: SyncTargetFlags = {};

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

      await runSync(config, {
        names: selected.length === 0 ? keys(syncTargets) : selected,
        flags,
      });

      await settleChanges(config, {
        check,
      });
    });
});
