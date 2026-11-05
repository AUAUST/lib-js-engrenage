import { afterEach, describe, expect, test, vi } from "vitest";

import { launch } from "#bin/engrenage/launch";

const failure = new Error("src is broken");

function load(): Promise<never> {
  return Promise.reject(failure);
}

describe("launch", () => {
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  test("a hook command that cannot load exits 2 with the message", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    await launch(load, [
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
    await expect(launch(load, ["node", "engrenage", "sync"])).rejects.toBe(
      failure,
    );
  });
});
