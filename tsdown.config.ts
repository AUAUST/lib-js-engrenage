import { packages } from "#constants";
import { defineTsdownConfig } from "#tools/tsdown/index";

export default defineTsdownConfig({
  // @debt transitive dependencies of commander and @clack are hand-listed and mirrored in `inlinedDependencies`; bundling a package should bring its own dependency closure
  bundle: [
    packages.toolkit,
    packages.primitiveKit,
    "commander",
    "@commander-js/extra-typings",
    "jsonc-parser",
    "shell-quote",
    "@clack/prompts",
    "@clack/core",
    "fast-string-truncated-width",
    "fast-string-width",
    "fast-wrap-ansi",
    "sisteransi",
    "@octokit/core",
    "@octokit/plugin-paginate-rest",
    "@octokit/request-error",
    "@octokit/auth-token",
    "@octokit/endpoint",
    "@octokit/graphql",
    "@octokit/request",
    "before-after-hook",
    "content-type",
    "json-with-bigint",
    "universal-user-agent",
  ],
});
