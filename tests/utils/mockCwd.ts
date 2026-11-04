import { onTestFinished, vi } from "vitest";

export function mockCwd(root: string) {
  const cwd = vi.spyOn(process, "cwd").mockReturnValue(root);

  onTestFinished(() => {
    cwd.mockRestore();
  });
}
