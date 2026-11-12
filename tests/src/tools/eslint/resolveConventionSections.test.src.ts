import { describe, expect, test, vi } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { resolveConventionSections } from "#tools/eslint/operations/resolveConventionSections";
import { defineConvention } from "#tools/eslint/utils/defineConvention";

describe("resolveConventionSections", () => {
  test("resolves only the sections a convention reads", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "type": "module" }',
    });

    const config = await loadConfig(project.root, {
      searchParents: false,
    });

    const spied = { ...config };
    const resolve = vi.spyOn(spied, "resolve");

    const convention = defineConvention({
      sections: { src: "src" },
    });

    const sections = await resolveConventionSections(spied, [convention]);

    expect(resolve.mock.calls).toEqual([["src"]]);

    expect(keys(sections.pick({ src: "src" }))).toEqual(["src"]);

    expect(sections.pick({ src: "src" }).src).toBe(await config.resolve("src"));
  });
});
