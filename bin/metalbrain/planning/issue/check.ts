import {
  argument,
  collectArgument,
  collectListArgument,
  command,
  option,
} from "#nexus/cli/index";

export default command({
  name: "check",
  description: "Check each ref: a ref with a local draft checks its manifest, its body against its type's contract and its references, without network; any other issue number checks the published issue against the issue contract, reporting its sub-issues and blocking issues as open, closed by an unpushed `Closes` commit of its repository's checkout or closed on GitHub, and the checkout's commits `Towards` it. Exit 1 with one line per finding.",
  arguments: [
    argument({
      name: "refs",
      description: "draft file stems or issue numbers, comma- or space-separated, such as `123,new-foo` or `123 new-foo`",
      variadic: true,
      reduce: collectListArgument,
    }),
  ],
  options: [
    option({
      name: "for",
      type: "string",
      placeholder: "role",
      description: "who a published issue is checked for",
      choices: ["worker", "debugger"],
      default: "worker",
    }),
    option({
      name: "checkout",
      type: "string",
      placeholder: "checkout",
      description: "checkout whose commits up to `<ref>`, `HEAD` by default, count for its repository's issues, as `<registered short name>=<directory>[@<ref>]`, repeatable; the current directory counts for its own repository unless a checkout names it; end with `@HEAD` when the directory holds an `@`",
      default: [],
      parse: collectArgument,
    }),
  ],
  action() {
    return import("#bin/metalbrain/planning/issue/actions/check");
  },
});
