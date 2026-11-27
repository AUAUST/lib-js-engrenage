import { argument, command, option } from "#nexus/cli/index";

export default command({
  name: "link",
  description: "Link a registered repository's installed package to its local checkout without changing tracked files, or list the links with their state.",
  arguments: [
    argument({
      name: "repository",
      description: "registered short name of the repository",
      optional: true,
    }),
    argument({
      name: "directory",
      description: "the repository's local checkout",
      optional: true,
    }),
  ],
  options: [
    option({
      name: "remove",
      type: "string",
      placeholder: "repository",
      description: "restore the installed package of a linked repository",
    }),
    option({
      name: "restore",
      type: "boolean",
      description: "repoint every recorded link at its checkout, after an install",
      default: false,
    }),
  ],
  action() {
    return import("#bin/engrenage/actions/link");
  },
});
