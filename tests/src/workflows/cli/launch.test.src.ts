import { afterEach, describe, expect, test, vi } from "vitest";

import { launch } from "#workflows/cli/index";

const failure = new Error("src is broken");

function run(): Promise<never> {
  return Promise.reject(failure);
}

describe("launch", () => {
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  test("a hook command that cannot load exits 2 with the message", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    await launch(run, [
      "node",
      "engrenage",
      "agents",
      "claude",
      "hook",
      "github",
    ]);

    expect(process.exitCode).toBe(2);

    expect(error).toHaveBeenCalledWith(
      "engrenage cannot load: src is broken; this check fails until it runs",
    );
  });

  test("any other command rethrows", async () => {
    await expect(launch(run, ["node", "engrenage", "sync"])).rejects.toBe(
      failure,
    );
  });
});

test.each(["claude", "codex"])(
  "%s hook dependency/config loading failures stay blocking",
  async (provider) => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    for (const message of [
      "Cannot find package required-dependency",
      "Missing required config",
    ]) {
      await launch(
        () => Promise.reject(new Error(message)),
        ["node", "engrenage", "agents", provider, "hook", "dispatch"],
      );

      expect(process.exitCode).toBe(2);
    }

    process.exitCode = undefined;
    vi.restoreAllMocks();
  },
);
