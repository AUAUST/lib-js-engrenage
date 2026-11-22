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
