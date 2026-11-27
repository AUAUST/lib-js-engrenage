import {
  argument,
  collectListArgument,
  command,
  option,
} from "#nexus/cli/index";

export default command({
  name: "add",
  description: "Add a backlog entry and print its ID.",
  chain: true,
  arguments: [
    argument({ name: "category", description: "an existing category's name" }),
    argument({ name: "title", description: "the problem or need" }),
  ],
  options: [
    option({
      name: "sites",
      type: "string",
      placeholder: "sites",
      description: "code sites as `<path>:<line>`, each naming an existing file; comma-separated or repeated",
      parse: collectListArgument,
    }),
    option({
      name: "why",
      type: "string",
      placeholder: "text",
      description: "context",
      multiple: true,
    }),
    option({
      name: "want",
      type: "string",
      placeholder: "text",
      description: "expected outcome",
      multiple: true,
    }),
    option({
      name: "done",
      type: "string",
      placeholder: "text",
      description: "completion or obsolescence condition",
      multiple: true,
    }),
    option({
      name: "keywords",
      type: "string",
      placeholder: "keywords",
      description: "extra terms for the similar-entry search, not stored; comma-separated or repeated",
      parse: collectListArgument,
    }),
  ],
  help: {
    after() {
      return import("#bin/metalbrain/backlog/actions/wordCapHelp");
    },
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/add");
  },
  parse(category, title, options, _invocation) {
    return [category, title, options];
  },
});
