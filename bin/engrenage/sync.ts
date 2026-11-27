import { argument, command, option } from "#nexus/cli/index";

export default command({
  name: "sync",
  description: "Update the existing project files that engrenage derives from the config. `engrenage init` creates missing ones.",
  arguments: [
    argument({
      name: "targets",
      description: "targets to sync, plus every fill target (all by default)",
      optional: true,
      variadic: true,
      choices() {
        return import("#bin/engrenage/actions/syncTargets");
      },
    }),
  ],
  options: [
    option({
      name: "check",
      type: "boolean",
      description: "report outdated files without writing them",
      default: false,
    }),
    () => {
      return import("#bin/engrenage/actions/syncOptions");
    },
  ],
  action() {
    return import("#bin/engrenage/actions/sync");
  },
  parse(targets, { check }, { options }) {
    return [targets, { check, values: options }];
  },
});
