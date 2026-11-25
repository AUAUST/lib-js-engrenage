import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description(
        "Rewrite every backlog site naming a moved file, or a path under a moved directory, to its new path, its line kept, and print each rewritten site; writes nothing when no site names the old path or a rewritten site names no file.",
      )
      .argument(
        "<old>",
        "the file's or directory's former path from the project root",
      )
      .argument("<new>", "its new path from the project root");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/relocate");
  },
});
