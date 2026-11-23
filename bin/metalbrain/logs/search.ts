import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "List the entries holding a keyword in any field, ID included, ignoring case, one line each as `list` prints them.",
      )
      .argument("<keyword>", "text to find");
  },
  action() {
    return import("#bin/metalbrain/logs/actions/search");
  },
  parse(keyword, _options, command) {
    return [command.parent?.name() ?? "", keyword];
  },
});
