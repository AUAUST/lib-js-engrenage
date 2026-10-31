import { packages } from "#constants";
import { defineTsdownConfig } from "#tsdown/index";

export default defineTsdownConfig({
  bundle: [
    packages.toolkit,
    packages.primitiveKit,
    "commander",
    "@commander-js/extra-typings",
    "jsonc-parser",
    "@clack/prompts",
    "@clack/core",
    "fast-string-truncated-width",
    "fast-string-width",
    "fast-wrap-ansi",
    "sisteransi",
  ],
});
