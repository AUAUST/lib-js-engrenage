import { Argument, Option } from "@commander-js/extra-typings";
import { boolean, optional } from "valibot";

import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries, keys } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/index";
import { defineLazyCommand } from "#workflows/cli/index";
import { syncTargetFlags } from "#workflows/sync/constants";
import type { SyncTargetFlags, SyncTargetName } from "#workflows/sync/index";

function listFlagOptions(): readonly {
  target: SyncTargetName;
  flag: string;
  option: Option;
}[] {
  return flatMap(entries(syncTargetFlags), ([target, flags]) => {
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

export default defineLazyCommand({
  configure(command) {
    command.description(
      "Update the existing project files that engrenage derives from the config. `engrenage init` creates missing ones.",
    );

    for (const { option } of listFlagOptions()) {
      command.addOption(option);
    }

    return command
      .addArgument(
        new Argument(
          "[targets...]",
          "targets to sync (all by default)",
        ).choices(keys(syncTargetFlags)),
      )
      .option("--check", "report outdated files without writing them", false);
  },
  action() {
    return import("#bin/engrenage/actions/sync");
  },
  parse(targets, { check }, command) {
    const flags: SyncTargetFlags = {};

    for (const { target, flag, option } of listFlagOptions()) {
      const value = validate(
        optional(boolean()),
        command.getOptionValue(option.attributeName()),
        `--${option.name()}`,
      );

      if (value !== undefined) {
        flags[target] = {
          ...flags[target],
          [flag]: value,
        };
      }
    }

    return [
      targets.length === 0 ? keys(syncTargetFlags) : targets,
      { check, flags },
    ];
  },
});
