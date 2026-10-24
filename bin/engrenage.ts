#!/usr/bin/env node
import { syncAgentFiles } from "#agents/utils/syncAgentFiles";
import { parseArgs } from "node:util";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    check: {
      type: "boolean",
      default: false,
    },
  },
});

const [scope, command] = positionals;

function runAgentsSync(check: boolean) {
  const outdated = syncAgentFiles({
    root: process.cwd(),
    check,
  });

  for (const file of outdated) {
    console.info(check ? `outdated: ${file}` : `synced: ${file}`);
  }

  if (check && outdated.length > 0) {
    process.exitCode = 1;
  }
}

if (scope === "agents" && command === "sync") {
  runAgentsSync(values.check);
} else {
  console.error("Usage: engrenage agents sync [--check]");

  process.exitCode = 1;
}
