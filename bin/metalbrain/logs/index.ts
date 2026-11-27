import {
  argument,
  command,
  option,
  type CommandDeclaration,
} from "#nexus/cli/index";

export const search = command({
  name: "search",
  description: "Rank entries against a query; at the top level, across every record kind.",
  arguments: [
    argument({
      name: "query",
      description: "the query in GitHub code search syntax, its arguments joined by spaces; `field:value` filters by an entry field",
      optional: true,
      variadic: true,
    }),
  ],
  options: [
    () => {
      return import("#bin/metalbrain/actions/searchOptions");
    },
  ],
  action() {
    return import("#bin/metalbrain/actions/search");
  },
  parse(words, _options, { path, options }) {
    return [words, options, path.at(-2)];
  },
});

export const merge = command({
  name: "merge",
  description: "Remove a new entry recording what another does, and tap the kept one.",
  arguments: [
    argument({ name: "new-id", description: "the entry to remove" }),
    argument({ name: "kept-id", description: "the entry to keep and tap" }),
  ],
  options: [
    option({
      name: "note",
      type: "string",
      placeholder: "text",
      description: "the tap's note, on one line; defaults to the removed entry's title or subject",
    }),
  ],
  action() {
    return import("#bin/metalbrain/actions/merge");
  },
  parse(removed, kept, { note }, { path }) {
    return [removed, kept, note, path.at(-2) ?? ""];
  },
});

export const tap = command({
  name: "tap",
  description: "Record that entries mattered again, none when an ID is unknown.",
  arguments: [
    argument({
      name: "ids",
      description: "the entries' IDs",
      variadic: true,
      separator: ",",
    }),
  ],
  options: [
    option({
      name: "note",
      type: "string",
      placeholder: "text",
      description: "context the entries lack, on one line",
    }),
  ],
  action() {
    return import("#bin/metalbrain/actions/tap");
  },
  parse(ids, { note }, { path }) {
    return [ids, note, path.at(-2) ?? ""];
  },
});

const add = command({
  name: "add",
  description: "Add an entry and print its ID.",
  options: [
    option({
      name: "keywords",
      type: "string",
      placeholder: "keywords",
      description: "extra terms for the similar-entry search, not stored",
      multiple: true,
      separator: ",",
    }),
    () => {
      return import("#bin/metalbrain/logs/actions/fieldOptions");
    },
  ],
  action() {
    return import("#bin/metalbrain/logs/actions/add");
  },
  parse({ keywords = [] }, { path, options }) {
    return [path.at(-2) ?? "", options, keywords];
  },
});

const list = command({
  name: "list",
  description: "List the entries.",
  options: [
    () => {
      return import("#bin/metalbrain/logs/actions/filterOptions");
    },
  ],
  action() {
    return import("#bin/metalbrain/logs/actions/list");
  },
  parse(_options, { path, options }) {
    return [path.at(-2) ?? "", options];
  },
});

const show = command({
  name: "show",
  description: "Print entries in full.",
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
  parse(ids, { path }) {
    return [ids, path.at(-2) ?? ""];
  },
});

const update = command({
  name: "update",
  description: "Replace fields of an entry.",
  arguments: [argument({ name: "id", description: "the entry's ID" })],
  options: [
    () => {
      return import("#bin/metalbrain/logs/actions/fieldOptions");
    },
  ],
  action() {
    return import("#bin/metalbrain/logs/actions/update");
  },
  parse(id, _options, { path, options }) {
    return [path.at(-2) ?? "", id, options];
  },
});

const close = command({
  name: "close",
  description: "Remove entries, none when an ID is unknown.",
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
  parse(ids, { path }) {
    return [ids, path.at(-2) ?? ""];
  },
});

const stats = command({
  name: "stats",
  description: "Count the entries per subject, flagging recurring subjects.",
  action() {
    return import("#bin/metalbrain/logs/actions/stats");
  },
  parse({ path }) {
    return [path.at(-2) ?? ""];
  },
});

export function defineLogGroup({
  name,
  taps,
}: {
  name: string;
  taps?: boolean;
}): CommandDeclaration {
  return command({
    name,
    description: `Manage the ${name} log's entries.`,
    subcommands: [
      add,
      list,
      search,
      show,
      ...(taps === true ? [tap, merge] : []),
      update,
      close,
      stats,
    ],
  });
}
