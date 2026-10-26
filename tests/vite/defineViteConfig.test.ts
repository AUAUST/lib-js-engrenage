import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { defineViteConfig } from "@auaust/engrenage/vite";
import { afterEach, describe, expect, test, vi } from "vitest";

const root = fileURLToPath(new URL("../fixtures/vitest", import.meta.url));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineViteConfig", () => {
  test("applies the project defaults under the native config", async () => {
    vi.spyOn(process, "cwd").mockReturnValue(root);

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
