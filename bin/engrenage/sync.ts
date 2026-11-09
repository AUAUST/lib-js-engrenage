import { Argument } from "@commander-js/extra-typings";

import { map } from "@auaust/primitive-kit/arrays";
import { record } from "@auaust/toolkit/object";

import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Update the existing project files that engrenage derives from the config. `engrenage init` creates missing ones.",
      )
      .addArgument(
        new Argument("[targets...]", "targets to sync (all by default)"),
      )
      .option("--check", "report outdated files without writing them", false);
  },
  extend() {
    return import("#bin/engrenage/actions/syncOptions");
  },
  action() {
    return import("#bin/engrenage/actions/sync");
  },
  parse(targets, { check }, command) {
    const values = record(
      map(command.options, (option) => {
        const name = option.attributeName();

        return [name, command.getOptionValue(name)];
      }),
    );

    return [targets, { check, values }];
  },
});
