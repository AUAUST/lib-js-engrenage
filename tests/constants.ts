import { freeze } from "@auaust/toolkit/object";

export const gateIdentity = freeze({
  runtime: "claude",
  session: "session",
  agent: "agent",
});

export const eslintPackageJson = JSON.stringify({
  type: "module",
  devDependencies: {
    eslint: "*",
    typescript: "*",
  },
});

// @debt a fixed budget for the cold module loading and whole-project work a file's first test pays, measured at 1.5-2s alone and up to 9s beside two other suites: heavier load can still exceed it
export const workflowTimeout = 30_000;

export const nexusModule = new URL("../src/nexus/cli/index.ts", import.meta.url)
  .href;
