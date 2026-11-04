import { describe, expect, test } from "vitest";

import { editions } from "#baseline/editions/index";
import { configSchema } from "#config/config/schemas/configSchema";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { validate } from "#options/utils/validate";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";
import { withSourceRuntime } from "#tests/helpers/withSourceRuntime";
import { syncEditions } from "#typescript/utils/syncEditions";

describe("editions", () => {
  test("dates the libs of the committed editions", () => {
    expect(editions.es2015["es2015.core"]).toBe("2020-01-15");
    expect(editions.es2022["es2022.intl"]).toBe("2024-04-16");
    expect(editions.es2023["es2023.array"]).toBe("2023-07-04");
    expect(editions.es2023["es2023.collection"]).toBe("2025-12-09");
    expect(editions.es2024["es2024.sharedmemory"]).toBe("2025-11-11");
    expect(editions.es2025["es2025.collection"]).toBe("2024-06-11");
    expect(editions.es2024).toHaveProperty("es2024.object");
    expect(editions.es2024).not.toHaveProperty("es2023.array");
  });
});

describe("syncEditions", () => {
  test("fails naming a declaration that matches no compat key", async () => {
    const project = createTemporaryProject({
      "package.json": "{}",
    });

    const config = createResolvedConfig({
      root: project.root,
      raw: validate(configSchema, withSourceRuntime({}), "test config"),
      configFile: undefined,
    });

    await expect(
      syncEditions(config, {
        libraries: getFixture("typescript/editions/libs"),
      }),
    ).rejects.toThrow("lib.es2015.core.d.ts declares Array.unknownMember");
  });
});
