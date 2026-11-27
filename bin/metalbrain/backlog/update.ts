import {
  argument,
  collectArgument,
  collectListArgument,
  command,
  option,
} from "#nexus/cli/index";

export default command({
  name: "update",
  description: "Replace or remove fields of a backlog entry.",
  chain: true,
  arguments: [argument({ name: "id", description: "the entry's ID" })],
  options: [
    option({
      name: "title",
      type: "string",
      placeholder: "title",
      description: "the problem or need",
    }),
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
      description: "context; repeat for a list",
      parse: collectArgument,
    }),
    option({
      name: "want",
      type: "string",
      placeholder: "text",
      description: "expected outcome; repeat for a list",
      parse: collectArgument,
    }),
    option({
      name: "done",
      type: "string",
      placeholder: "text",
      description: "completion or obsolescence condition; repeat for a list",
      parse: collectArgument,
    }),
    option({
      name: "unset",
      type: "string",
      placeholder: "field",
      description: "fields to remove: `sites`, `why`, `want` or `done`; comma-separated or repeated",
      default: [],
      parse: collectListArgument,
    }),
  ],
  action() {
    return import("#bin/metalbrain/backlog/actions/update");
  },
  parse(id, options, _invocation) {
    return [id, options];
  },
});
