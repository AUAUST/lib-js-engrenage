import { describe, expect, test } from "vitest";

import { renderWorkflow } from "#tools/github/operations/renderWorkflow";

const installStep =
  "      - name: Install dependencies\n        run: pnpm install --frozen-lockfile\n        env:\n          NODE_AUTH_TOKEN: ${{ secrets.NPM_READ_TOKEN }}\n";

describe("renderWorkflow", () => {
  test.each([
    ["ci.yml", "."],
    ["ci.yml", "packages/app"],
    ["publish.yml", "."],
    ["publish.yml", "packages/app"],
  ])(
    "gives only the install step of %s in %s the read-only token",
    async (file, directory) => {
      const workflow = await renderWorkflow("library", file, directory);

      expect(workflow).toContain('registry-url: "https://registry.npmjs.org"');
      expect(workflow).toContain(installStep);
      expect(workflow.split("NODE_AUTH_TOKEN")).toHaveLength(2);
    },
  );
});
