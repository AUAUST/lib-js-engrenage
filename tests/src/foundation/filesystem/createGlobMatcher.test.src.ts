import { matchesGlob } from "node:path";

import { expect, test } from "vitest";

import { createGlobMatcher } from "#foundation/filesystem/utils/createGlobMatcher";
import { escapeGlob } from "#foundation/filesystem/utils/escapeGlob";

const globs = [
  "theme/assets/d-a.js",
  ".env",
  "dist/**",
  "extensions/home/dist",
  "**/node_modules",
  "src/**/*.test.ts",
];

const paths = [
  "theme/assets/d-a.js",
  "theme/assets/d-b.js",
  "Theme/assets/d-a.js",
  ".env",
  "nested/.env",
  "dist",
  "dist/index.js",
  "dist/chunks/a.js",
  "dist/.vite/manifest.json",
  "dist/chunks/.cache/a.js",
  "distribution/a.js",
  "extensions/home/dist",
  "extensions/home/dist/a.js",
  "a/node_modules",
  "src/a/b.test.ts",
  "src/a/b.ts",
];

test("answers as matchesGlob with any of the globs", () => {
  const matches = createGlobMatcher(globs);

  for (const path of paths) {
    expect([path, matches(path)]).toEqual([
      path,
      globs.some((glob) => matchesGlob(path, glob)),
    ]);
  }
});

test("matches nothing without globs", () => {
  expect(createGlobMatcher([])("a")).toBe(false);
});

test("matches an escaped path as the literal path it names", () => {
  const matches = createGlobMatcher([
    escapeGlob("src/[id]/{a,b}!.ts"),
    `${escapeGlob("a*\\b")}/**`,
  ]);

  expect(matches("src/[id]/{a,b}!.ts")).toBe(true);
  expect(matches("src/i/a!.ts")).toBe(false);
  expect(matches("a*\\b/c.js")).toBe(true);
  expect(matches("axb/c.js")).toBe(false);
});
