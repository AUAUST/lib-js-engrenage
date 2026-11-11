import { defineLazyCommand } from "#workflows/cli/index";

export default defineLazyCommand({
  configure(command) {
    return command.description(
      "Write the labels of every registered repository and the issue types and fields of their organizations to the committed GitHub snapshot.",
    );
  },
  action() {
    return import("#bin/engrenage/github/actions/fetch");
  },
});
