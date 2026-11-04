import { spawn } from "node:child_process";

import { onTestFinished, vi } from "vitest";

export async function captureBinaryOutput(): Promise<() => string> {
  const actual = await vi.importActual<{
    spawn: typeof spawn;
  }>("node:child_process");

  let output = "";

  vi.mocked(spawn).mockImplementation((command, args, options) => {
    const child = actual.spawn(command, args, {
      ...options,
      stdio: "pipe",
    });

    function record(chunk: Buffer) {
      output += chunk.toString();
    }

    child.stdout.on("data", record);
    child.stderr.on("data", record);

    return child;
  });

  onTestFinished(() => {
    vi.mocked(spawn).mockReset();
  });

  return () => output;
}
