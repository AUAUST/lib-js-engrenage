import { describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { loadValidatedConfig } from "#project/config/operations/loadValidatedConfig";
import { validateConfig } from "#project/config/operations/validateConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

vi.mock(
  import("#project/config/operations/validateConfig"),
  async (importOriginal) => {
    const original = await importOriginal();

    return { validateConfig: vi.fn(original.validateConfig) };
  },
);

describe("loadValidatedConfig", () => {
  test("validates a loaded config once, and again once reloaded after a refresh", async () => {
    const { root } = createTemporaryProject({
      "package.json": "{}",
      "engrenage.config.ts": "export default {};\n",
    });

    const first = await loadValidatedConfig(root);

    expect(await loadValidatedConfig(root)).toBe(first);
    expect(validateConfig).toHaveBeenCalledOnce();

    loadConfig.refresh(first.context.root);

    expect(await loadValidatedConfig(root)).not.toBe(first);
    expect(validateConfig).toHaveBeenCalledTimes(2);
  });
});
