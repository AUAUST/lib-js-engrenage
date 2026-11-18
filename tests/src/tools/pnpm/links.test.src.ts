import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { dirname } from "node:path";

import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { linkCheckout } from "#tools/pnpm/operations/linkCheckout";
import { listLinks } from "#tools/pnpm/operations/listLinks";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import { restoreLinks } from "#tools/pnpm/operations/restoreLinks";
import { unlinkCheckout } from "#tools/pnpm/operations/unlinkCheckout";

const name = "@auaust/engrenage";
const installed = "../.pnpm/engrenage/node_modules/@auaust/engrenage";
const linkPath = `node_modules/${name}`;

function repositories() {
  return Promise.resolve(new Map([["engrenage", "AUAUST/engrenage"]]));
}

function git(root: string, args: readonly string[]) {
  execFileSync("git", args, { cwd: root, stdio: "ignore" });
}

function createConsumer(dependencies: Record<string, string>) {
  const consumer = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "app",
      type: "module",
      devDependencies: dependencies,
    }),
    "node_modules/.pnpm/engrenage/node_modules/@auaust/engrenage/package.json": JSON.stringify(
      { name, version: "1.0.0" },
    ),
  });

  mkdirSync(dirname(consumer.resolve(linkPath)), { recursive: true });

  symlinkSync(installed, consumer.resolve(linkPath));

  return consumer;
}

function createCheckout(origin = "AUAUST/engrenage") {
  const checkout = createTemporaryProject({
    "package.json": JSON.stringify({ name, version: "1.1.0" }),
    "dist/bin/engrenage.mjs": "export {};\n",
  });

  git(checkout.root, ["init", "--quiet", "--initial-branch=main"]);

  git(checkout.root, [
    "remote",
    "add",
    "origin",
    `git@github.com:${origin}.git`,
  ]);

  git(checkout.root, [
    "commit",
    "--quiet",
    "--allow-empty",
    "-m",
    "chore: start",
  ]);

  return checkout;
}

function readTarget(root: string) {
  return realpathSync(`${root}/${linkPath}`);
}

async function checkLinks(root: string) {
  const config = await loadConfig(root, { reporter: createTestReporter() });

  try {
    const [failure] = await runSync(config, { names: ["links"] });

    return failure?.error;
  } finally {
    loadConfig.refresh(root);
  }
}

describe("links", () => {
  test("links a checkout, lists it, and restores the installed package on removal", async () => {
    const consumer = createConsumer({ [name]: "^1.0.0" });
    const checkout = createCheckout();

    await linkCheckout(
      { root: consumer.root, repositories },
      "engrenage",
      checkout.root,
    );

    expect(await readLinks(consumer.root)).toEqual({
      engrenage: { directory: checkout.root, installed },
    });

    expect(readTarget(consumer.root)).toBe(checkout.root);

    expect(await listLinks(consumer.root)).toEqual([
      expect.objectContaining({ short: "engrenage", holds: true }),
    ]);

    await unlinkCheckout(consumer.root, "engrenage");

    expect(readlinkSync(consumer.resolve(linkPath))).toBe(installed);

    expect(await readLinks(consumer.root)).toEqual({});
  });

  test("fails the sync check once an install repoints the symlink, until restored", async () => {
    const consumer = createConsumer({ [name]: "^1.0.0" });
    const checkout = createCheckout();

    await linkCheckout(
      { root: consumer.root, repositories },
      "engrenage",
      checkout.root,
    );

    rmSync(consumer.resolve(linkPath));

    symlinkSync(installed, consumer.resolve(linkPath));

    expect(await checkLinks(consumer.root)).toEqual(
      expect.objectContaining({
        message: expect.stringContaining("run `engrenage link --restore`"),
      }),
    );

    expect(await restoreLinks(consumer.root)).toEqual(["engrenage"]);

    expect(await checkLinks(consumer.root)).toBeUndefined();
  });

  test("refuses a checkout of another repository or a package the consumer does not depend on", async () => {
    const other = createCheckout("AUAUST/toolkit");
    const consumer = createConsumer({ [name]: "^1.0.0" });

    await expect(
      linkCheckout(
        { root: consumer.root, repositories },
        "engrenage",
        other.root,
      ),
    ).rejects.toThrow("origin AUAUST/toolkit, not AUAUST/engrenage");

    const unrelated = createConsumer({});

    await expect(
      linkCheckout(
        { root: unrelated.root, repositories },
        "engrenage",
        createCheckout().root,
      ),
    ).rejects.toThrow("in neither dependencies nor devDependencies");

    expect(readlinkSync(consumer.resolve(linkPath))).toBe(installed);

    expect(readlinkSync(unrelated.resolve(linkPath))).toBe(installed);
  });
});
