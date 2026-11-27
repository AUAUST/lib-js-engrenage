import { argument, command, option } from "#nexus/cli/index";

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
      description: "code sites as `<path>:<line>`, each naming an existing file",
      multiple: true,
      separator: ",",
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
      name: "unset",
      type: "string",
      placeholder: "field",
      description: "fields to remove: `sites`, `why`, `want` or `done`",
      default: [],
      multiple: true,
      separator: ",",
    }),
  ],
  action() {
    return import("#bin/metalbrain/backlog/actions/update");
  },
  parse(id, options, _invocation) {
    return [id, options];
  },
});
