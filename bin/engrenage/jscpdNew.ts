import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command
      .description("List by name the clones added since a git ref.")
      .argument("<ref>", "git ref the clones are compared with");
  },
  action() {
    return import("#bin/engrenage/actions/jscpdNew");
  },
});
