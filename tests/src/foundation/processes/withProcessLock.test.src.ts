import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test, vi } from "vitest";

import { LockTimeoutError } from "#foundation/processes/errors/LockTimeoutError";
import { withProcessLock } from "#foundation/processes/operations/withProcessLock";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const source = fileURLToPath(
  new URL(
    "../../../../src/foundation/processes/operations/withProcessLock.ts",
    import.meta.url,
  ),
);

function createHolder(pid: number) {
  return JSON.stringify({
    pid,
    token: "holder",
    label: "test",
    started: "2026-11-08T00:00:00.000Z",
  });
}

function readDeadPid(): number {
  const { pid } = spawnSync(process.execPath, ["-e", ""]);

  if (pid === undefined) {
    throw new Error("Cannot spawn a process");
  }

  return pid;
}

describe("withProcessLock", () => {
  test("runs concurrent holders one after the other", async () => {
    const project = createTemporaryProject();

    const file = project.resolve("cache/lock");

    const events: string[] = [];

    const onWait = vi.fn();

    function hold(name: string) {
      return withProcessLock(
        file,
        {
          label: name,
          timeout: 5000,
          onWait,
        },
        async () => {
          events.push(`${name} start`);

          await new Promise((resolve) => {
            setTimeout(resolve, 200);
          });

          events.push(`${name} end`);
        },
      );
    }

    const first = hold("first");

    await vi.waitFor(() => {
      expect(existsSync(file)).toBe(true);
    });

    await Promise.all([first, hold("second")]);

    expect(events).toEqual([
      "first start",
      "first end",
      "second start",
      "second end",
    ]);

    expect(onWait).toHaveBeenCalledOnce();

    expect(onWait).toHaveBeenCalledWith(
      expect.objectContaining({ label: "first" }),
    );

    expect(existsSync(file)).toBe(false);
  });

  test("breaks a dead or unparseable holder", async () => {
    const project = createTemporaryProject();

    const file = project.resolve("lock");

    const options = {
      label: "test",
      timeout: 1000,
      onWait: vi.fn(),
    };

    for (const content of [createHolder(readDeadPid()), "{"]) {
      project.write("lock", content);

      expect(await withProcessLock(file, options, async () => "ran")).toBe(
        "ran",
      );
    }

    expect(options.onWait).not.toHaveBeenCalled();
  });

  test("times out on a live holder and leaves it in place", async () => {
    const project = createTemporaryProject();

    const child = spawn(process.execPath, [
      "-e",
      "setTimeout(() => {}, 60_000)",
    ]);

    try {
      const content = createHolder(child.pid ?? 0);

      project.write("lock", content);

      const run = vi.fn();

      const error = await withProcessLock(
        project.resolve("lock"),
        {
          label: "test",
          timeout: 1000,
          onWait: vi.fn(),
        },
        run,
      ).catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(LockTimeoutError);

      expect(error).toMatchObject({
        holder: { pid: child.pid },
      });

      expect(run).not.toHaveBeenCalled();
      expect(project.read("lock")).toBe(content);
    } finally {
      child.kill();
    }
  });

  test("releases the lock when run throws", async () => {
    const project = createTemporaryProject();

    const file = project.resolve("lock");

    await expect(
      withProcessLock(
        file,
        {
          label: "test",
          timeout: 1000,
          onWait: vi.fn(),
        },
        async () => {
          throw new Error("failed");
        },
      ),
    ).rejects.toThrow("failed");

    expect(existsSync(file)).toBe(false);
  });

  test("releases the lock and exits by the signal it receives", async () => {
    const project = createTemporaryProject();

    const file = project.resolve("lock");

    const script = String.raw`
      const { withProcessLock } = await import(${JSON.stringify(source)});
      await withProcessLock(${JSON.stringify(file)}, { label: "child", timeout: 1000, onWait() {} }, () => {
        setInterval(() => {}, 1000);
        process.stdout.write("held\n");
        return new Promise(() => {});
      });
    `;

    const child = spawn(process.execPath, [
      "--input-type=module",
      "-e",
      script,
    ]);

    await once(child.stdout, "data");

    expect(existsSync(file)).toBe(true);

    child.kill("SIGTERM");

    const [code, signal] = await once(child, "exit");

    expect({ code, signal }).toEqual({
      code: null,
      signal: "SIGTERM",
    });

    expect(existsSync(file)).toBe(false);
  });
});
