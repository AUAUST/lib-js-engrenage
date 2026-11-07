import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import manifest from "#package.json" with { type: "json" };

const run = promisify(execFile);

function rejectPeers(peers: readonly string[]): string {
  return `
import { registerHooks } from "node:module";

const peers = ${JSON.stringify(peers)};

registerHooks({
  resolve(specifier, context, next) {
    if (peers.some((peer) => specifier === peer || specifier.startsWith(peer + "/"))) {
      throw new Error("Optional peer imported: " + specifier);
    }

    return next(specifier, context);
  },
});
`;
}

test("the root entry imports with no optional peer installed", async () => {
  const hook = rejectPeers(keys(manifest.peerDependenciesMeta));

  const { stderr } = await run(
    process.execPath,
    [
      "--import",
      `data:text/javascript,${encodeURIComponent(hook)}`,
      "--input-type=module",
      "--eval",
      `await import("${manifest.name}");`,
    ],
    { cwd: fileURLToPath(new URL("../../", import.meta.url)) },
  );

  expect(stderr).toBe("");
});
