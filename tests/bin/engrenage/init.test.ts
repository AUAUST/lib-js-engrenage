import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { sort } from "@auaust/primitive-kit/arrays";
import { entries, keys, record } from "@auaust/toolkit/object";

import { init } from "#bin/engrenage/init";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

import * as prompts from "#support/scaffold/utils/createPrompter";

import manifest from "#package.json" with { type: "json" };

vi.mock(import("node:child_process"));

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

function linkSourcePackage(target: string) {
  mkdirSync(target, {
    recursive: true,
  });

  for (const entry of readdirSync(repositoryRoot)) {
    if (entry !== "package.json") {
      symlinkSync(join(repositoryRoot, entry), join(target, entry));
    }
  }

  const exports = record(
    entries(manifest.exports).map(([path, file]) => {
      return [path, file.replace(/^\.\/dist\/(.+)\.mjs$/, "./src/$1.ts")];
    }),
  );

  writeFileSync(
    join(target, "package.json"),
    JSON.stringify({
      ...manifest,
      exports,
    }),
  );
}

function createProject(files: Record<string, string>) {
  const project = createTemporaryProject(files);

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  mockCwd(project.root);

  return project;
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});

  vi.mocked(spawnSync).mockReturnValue({
    pid: 0,
    output: [],
    stdout: "",
    stderr: "",
    status: 0,
    signal: null,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

describe("engrenage init", () => {
  test("exits successfully without changes when the setup review is declined", async () => {
    const packageJson = '{"name":"project","type":"module"}';
    const config = "export default { agents: { preferred: [] } };\n";

    const project = createProject({
      "package.json": packageJson,
      "engrenage.config.ts": config,
    });

    const confirm = vi.fn().mockResolvedValue(false);

    vi.spyOn(prompts, "createPrompter").mockReturnValue({
      ...prompts.createPrompter({
        yes: true,
      }),
      confirm,
    });

    await runCommand(init);

    expect(confirm).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining("Review the missing setup"),
    );

    expect(project.read("package.json")).toBe(packageJson);
    expect(project.read("engrenage.config.ts")).toBe(config);

    expect(sort(readdirSync(project.root))).toEqual([
      "engrenage.config.ts",
      "node_modules",
      "package.json",
    ]);

    expect(spawnSync).not.toHaveBeenCalled();
    expect(process.exitCode ?? 0).toBe(0);
  });

  test.each(["vite", "tsdown", "vitest"])(
    "reviews missing setup without implicitly creating a %s config or filling package fields",
    async (tool) => {
      const packageJson = JSON.stringify({
        name: "project",
        type: "module",
        devDependencies: {
          [tool]: "*",
        },
      });

      const config = "export default { agents: { preferred: [] } };\n";

      const project = createProject({
        "package.json": packageJson,
        "engrenage.config.ts": config,
      });

      const confirm = vi
        .fn()
        .mockResolvedValue(false)
        .mockResolvedValueOnce(true);

      vi.spyOn(prompts, "createPrompter").mockReturnValue({
        ...prompts.createPrompter({
          yes: true,
        }),
        confirm,
      });

      await runCommand(init);

      expect(confirm).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("Review the missing setup"),
      );

      expect(confirm).toHaveBeenCalledWith(`Create ${tool}.config.ts?`, true);

      expect(confirm).toHaveBeenCalledWith(
        "Fill in the missing package.json fields?",
        true,
      );

      expect(existsSync(project.resolve(`${tool}.config.ts`))).toBe(false);
      expect(project.read("package.json")).toBe(packageJson);
      expect(project.read("engrenage.config.ts")).toBe(config);
      expect(spawnSync).not.toHaveBeenCalled();
      expect(process.exitCode ?? 0).toBe(0);
    },
  );

  test("fills the gaps of a configured project, installs added dependencies and syncs", async () => {
    const project = createProject({
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude"] } };\n',
      "package.json": '{\n  "name": "project",\n  "type": "module"\n}\n',
      ".gitignore": "node_modules\n.DS_Store\n\n# Scratch\n/scratch\n",
    });

    await runCommand(init, "--yes");

    const packageJson: unknown = JSON.parse(project.read("package.json"));

    expect(packageJson).toMatchObject({
      name: "project",
      version: "0.0.0",
      private: true,
      license: "UNLICENSED",
      author: manifest.author,
      prettier: "@auaust/engrenage/prettier",
      scripts: {
        "ci": "pnpm run ci:check && pnpm run ci:test",
        "ci:check":
          "engrenage sync --check && engrenage typecheck && engrenage eslint",
        "test": "engrenage vitest && engrenage typecheck",
        "typecheck": "engrenage typecheck",
        "format": "engrenage prettier",
        "lint": "engrenage eslint",
        "lint:check": "engrenage eslint",
        "lint:fix": "engrenage eslint:fix",
        "lint:suppress": "engrenage eslint:suppress",
        "ready":
          "pnpm install --frozen-lockfile && engrenage sync && pnpm run ci",
      },
      devDependencies: {
        "@auaust/engrenage": `^${manifest.version}`,
        "eslint": manifest.peerDependencies.eslint,
        "prettier": manifest.peerDependencies.prettier,
        "typescript": manifest.peerDependencies.typescript,
        "vitest": manifest.peerDependencies.vitest,
        "@changesets/cli": manifest.peerDependencies["@changesets/cli"],
      },
    });

    expect(packageJson).not.toHaveProperty("scripts.build");
    expect(packageJson).not.toHaveProperty("scripts.ci:publish");

    expect(JSON.parse(project.read("tsconfig.json"))).toEqual({
      extends: "@auaust/engrenage/tsconfig/base.json",
    });

    expect(project.read("vitest.config.ts")).toContain(
      "export default defineVitestConfig();",
    );

    expect(spawnSync).toHaveBeenCalledExactlyOnceWith("pnpm", ["install"], {
      cwd: project.root,
      stdio: "inherit",
    });

    expect(console.info).toHaveBeenCalledWith(
      "Run pnpm changeset init to finish the setup.",
    );

    expect(project.read("pnpm-workspace.yaml")).toBe(
      'allowBuilds:\n  "unrs-resolver": true\nminimumReleaseAgeExclude:\n  - "@auaust/*"\n',
    );

    expect(project.read("eslint.config.ts")).toContain(
      'import { defineEslintConfig } from "@auaust/engrenage/eslint";',
    );

    expect(project.read("CLAUDE.md")).toBe("@AGENTS.md\n");
    expect(project.read("AGENTS.md")).toContain("## Precedence and conflicts");
    expect(project.read(".prettierignore")).toContain("# @ignore defaults");

    expect(JSON.parse(project.read(".vscode/settings.json"))).toMatchObject({
      "editor.formatOnSave": true,
    });

    const gitignore = project.read(".gitignore");

    expect(gitignore).toMatch(
      /^# @ignore defaults\n\n# JavaScript\nnode_modules\n/,
    );

    expect(gitignore).toMatch(/# @end\n\n# Scratch\n\/scratch\n$/);
    expect(gitignore.match(/^node_modules$/gm)).toHaveLength(1);
  });

  test("leaves a complete project untouched", async () => {
    const project = createProject({
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude"] } };\n',
      "package.json": '{\n  "name": "project",\n  "type": "module"\n}\n',
      ".changeset/config.json": "{}\n",
    });

    await runCommand(init, "--yes");

    const completed = project.read("package.json");

    vi.clearAllMocks();

    await runCommand(init, "--yes");

    expect(spawnSync).not.toHaveBeenCalled();

    expect(console.info).toHaveBeenCalledExactlyOnceWith(
      "Engrenage is set up, nothing is missing.",
    );

    expect(project.read("package.json")).toBe(completed);

    expect(keys(JSON.parse(completed))).toEqual([
      "name",
      "version",
      "private",
      "license",
      "author",
      "type",
      "scripts",
      "devDependencies",
      "prettier",
    ]);
  });

  test("starts a library from an empty directory with the default answers", async () => {
    const project = createProject({});

    vi.mocked(spawnSync).mockImplementation((command, args) => {
      if (args?.[0] === "init") {
        project.write("package.json", '{\n  "type": "module"\n}\n');
      }

      return {
        pid: 0,
        output: [],
        stdout: "",
        stderr: "",
        status: 0,
        signal: null,
      };
    });

    await runCommand(init, "--yes");

    const name = basename(project.root);

    expect(vi.mocked(spawnSync).mock.calls).toEqual([
      [
        "pnpm",
        ["init", "--bare"],
        {
          cwd: project.root,
          stdio: "inherit",
        },
      ],
      [
        "pnpm",
        ["install"],
        {
          cwd: project.root,
          stdio: "inherit",
        },
      ],
    ]);

    expect(project.read("engrenage.config.ts")).toContain(
      'presets: ["library"]',
    );

    expect(JSON.parse(project.read("package.json"))).toMatchObject({
      name,
      version: "0.0.0",
      license: "GPL-3.0-only",
      scripts: {
        "build":
          "engrenage tsdown && engrenage typecheck:dist && engrenage vitest:dist",
        "ci:build": "pnpm run build",
        "ci:publish": "changeset publish",
        "ci:test": "engrenage vitest",
      },
      devDependencies: {
        tsdown: manifest.peerDependencies.tsdown,
        tsx: manifest.peerDependencies.tsx,
        vitest: manifest.peerDependencies.vitest,
      },
    });

    expect(JSON.parse(project.read("package.json"))).not.toHaveProperty(
      "private",
    );

    expect(JSON.parse(project.read("package.json"))).not.toHaveProperty(
      "publishConfig",
    );

    expect(existsSync(project.resolve("vite.config.ts"))).toBe(false);
    expect(project.read("tsdown.config.ts")).toContain("defineTsdownConfig");
    expect(project.read("vitest.config.ts")).toContain("defineVitestConfig");

    expect(JSON.parse(project.read("tsconfig.json"))).toEqual({
      extends: "@auaust/engrenage/tsconfig/library.json",
      compilerOptions: {
        paths: {
          [name]: ["./src/index.ts"],
        },
      },
    });

    expect(JSON.parse(project.read("tsconfig.dist.json"))).toEqual({
      extends: [
        "./tsconfig.json",
        "@auaust/engrenage/tsconfig/library.dist.json",
      ],
    });

    expect(project.read(".github/workflows/ci.yml")).toContain(
      "pnpm run ci:check",
    );
  });

  test("publishes a public scoped library with public access", async () => {
    const project = createProject({
      "package.json": '{\n  "name": "@scope/library",\n  "type": "module"\n}\n',
    });

    await runCommand(init, "--yes");

    expect(JSON.parse(project.read("package.json"))).toMatchObject({
      name: "@scope/library",
      license: "GPL-3.0-only",
      publishConfig: {
        access: "public",
      },
    });
  });
});

test("does not generate agent setup without selected agents", async () => {
  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": "export default {};\n",
  });

  await runCommand(init, "--yes");

  expect(project.read("engrenage.config.ts")).toBe("export default {};\n");

  for (const file of [
    "AGENTS.md",
    "CLAUDE.md",
    "AGENTS.override.md",
    ".claude/settings.json",
    ".codex/hooks.json",
  ]) {
    expect(existsSync(project.resolve(file))).toBe(false);
  }

  expect(console.info).toHaveBeenCalledWith(
    expect.stringContaining("Add agents.preferred: []"),
  );
});

test("sets up Codex without installing non-default rules", async () => {
  const input = 'export default { agents: { preferred: ["codex"] } };\n';

  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": input,
  });

  await runCommand(init, "--yes");

  expect(project.read("engrenage.config.ts")).toBe(input);

  expect(project.read("AGENTS.override.md")).toContain(
    "intended for OpenAI Codex",
  );

  expect(project.read("AGENTS.override.md")).toContain(
    "No project rule files are present.",
  );

  expect(project.read(".codex/hooks.json")).toContain(
    "engrenage agents codex hook edit",
  );

  expect(existsSync(project.resolve("CLAUDE.md"))).toBe(false);
  expect(existsSync(project.resolve(".claude/settings.json"))).toBe(false);

  expect(existsSync(project.resolve(".claude/rules/code-style.md"))).toBe(
    false,
  );
});

test("uses an interactive selection for this init without rewriting an existing config", async () => {
  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": "export default {};\n",
  });

  const prompter = prompts.createPrompter({
    yes: true,
  });

  vi.spyOn(prompts, "createPrompter").mockReturnValue({
    ...prompter,
    async multiselect(_message, values) {
      return [...values];
    },
  });

  await runCommand(init, "--yes");

  expect(project.read("engrenage.config.ts")).toBe("export default {};\n");
  expect(project.read("CLAUDE.md")).toBe("@AGENTS.md\n");

  expect(project.read("AGENTS.override.md")).toContain(
    "No project rule files are present.",
  );

  expect(project.read(".claude/settings.json")).toContain(
    "engrenage agents claude hook edit",
  );

  expect(project.read(".codex/hooks.json")).toContain(
    "engrenage agents codex hook edit",
  );

  expect(console.info).toHaveBeenCalledWith(
    expect.stringContaining('Add agents.preferred: ["claude","codex"]'),
  );
});
