import { defineLazyCommand } from "#workflows/cli/index";

// @debt the help states the count `recurringEntryCount` holds, since command definitions load with the hook graph and cannot import it
export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Count the entries by subject, ignoring case, most first, one line each: count and subject, flagging a subject with 3 or more entries as recurring.",
    );
  },
  action() {
    return import("#bin/metalbrain/logs/actions/stats");
  },
  parse(_options, command) {
    return [command.parent?.name() ?? ""];
  },
});
