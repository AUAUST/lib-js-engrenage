import { merge, search, tap } from "#bin/metalbrain/logs/index";
import { argument, command, option } from "#nexus/cli/index";

export default command({
  name: "backlog",
  description: "Manage the backlog's categories and entries.",
  subcommands: [
    command({
      name: "categories",
      description: "List the backlog categories with their purposes.",
      action() {
        return import("#bin/metalbrain/backlog/actions/categories");
      },
    }),
    command({
      name: "list",
      description: "List the backlog entries.",
      arguments: [
        argument({
          name: "category",
          description: "list only this category's entries",
          optional: true,
        }),
      ],
      action() {
        return import("#bin/metalbrain/backlog/actions/list");
      },
    }),
    search,
    command({
      name: "show",
      description: "Print backlog entries in full.",
      arguments: [
        argument({
          name: "ids",
          description: "the entries' IDs",
          variadic: true,
          separator: ",",
        }),
      ],
      action() {
        return import("#bin/metalbrain/actions/show");
      },
      parse(ids, _invocation) {
        return [ids, "backlog"];
      },
    }),
    tap,
    merge,
    command({
      name: "create",
      description: "Create an empty backlog category.",
      arguments: [
        argument({
          name: "category",
          description: "lowercase words joined by dashes",
        }),
        argument({
          name: "purpose",
          description: "the product or behavior the category owns",
        }),
      ],
      action() {
        return import("#bin/metalbrain/backlog/actions/create");
      },
    }),
    command({
      name: "add",
      description: "Add a backlog entry and print its ID.",
      arguments: [
        argument({
          name: "category",
          description: "an existing category's name",
        }),
        argument({ name: "title", description: "the problem or need" }),
      ],
      options: [
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
          name: "keywords",
          type: "string",
          placeholder: "keywords",
          description: "extra terms for the similar-entry search, not stored",
          multiple: true,
          separator: ",",
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
    }),
    command({
      name: "update",
      description: "Replace or remove fields of a backlog entry.",
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
    }),
    command({
      name: "move",
      description: "Move a backlog entry to another category, keeping its ID; deletes a category left empty.",
      arguments: [
        argument({ name: "id", description: "the entry's ID" }),
        argument({
          name: "category",
          description: "an existing category's name",
        }),
      ],
      action() {
        return import("#bin/metalbrain/backlog/actions/move");
      },
      parse(id, category, _invocation) {
        return [id, category];
      },
    }),
    command({
      name: "relocate",
      description: "Rewrite the backlog sites under a moved file or directory to its new path.",
      arguments: [
        argument({
          name: "old",
          description: "the file's or directory's former path from the project root",
        }),
        argument({
          name: "new",
          description: "its new path from the project root",
        }),
      ],
      action() {
        return import("#bin/metalbrain/backlog/actions/relocate");
      },
    }),
    command({
      name: "close",
      description: "Remove backlog entries, none when an ID is unknown; deletes a category left empty.",
      arguments: [
        argument({
          name: "ids",
          description: "the entries' IDs",
          variadic: true,
          separator: ",",
        }),
      ],
      action() {
        return import("#bin/metalbrain/actions/close");
      },
      parse(ids, _invocation) {
        return [ids, "backlog"];
      },
    }),
  ],
});
