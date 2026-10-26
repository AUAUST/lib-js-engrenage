import { join } from "node:path";

import { defineViteConfig } from "@auaust/engrenage/vite";
import { afterEach, describe, expect, test, vi } from "vitest";

import { getFixture } from "#tests/helpers/getFixture";
import { mockCwd } from "#tests/helpers/mockCwd";

const root = getFixture("vitest");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineViteConfig", () => {
  test("applies the project defaults under the native config", async () => {
    mockCwd(root);

    const viteConfig = await defineViteConfig({
      build: {
        sourcemap: true,
      },
    })({
      command: "build",
      mode: "production",
    });

    expect(viteConfig).toMatchObject({
      root,
      tsconfig: join(root, "tsconfig.json"),
      build: {
        outDir: "build",
        sourcemap: true,
      },
    });
  });
});
