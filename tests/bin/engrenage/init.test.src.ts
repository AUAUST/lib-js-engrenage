import { existsSync, readdirSync } from "node:fs";
import { basename } from "node:path";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { parse } from "yaml";

import { sort } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";

import { spawnProcess } from "#foundation/processes/operations/spawnProcess";
import { findCurrentMonth } from "#project/baseline/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";
import { mockCwd } from "#tests/utils/mockCwd";
import { readTestPnpmVersions } from "#tests/utils/readTestPnpmVersions";
import { scratchpadPlaceholders } from "#tools/agents/constants";
import type { Prompter } from "#project/steps/index";

import * as prompts from "#workflows/init/operations/createPrompter";

import init from "#bin/engrenage/actions/init";
import sync from "#bin/engrenage/actions/sync";
import manifest from "#package.json" with { type: "json" };

vi.mock(import("#foundation/processes/operations/spawnProcess"));

vi.mock(import("#tools/pnpm/operations/resolveLatestPnpm"), () => {
  return {
    resolveLatestPnpm: () => Promise.resolve(readTestPnpmVersions().latest),
  };
});

const visibilityQuestion = "Who can install the package?";

function answerSelect(question: string, answer: string): Prompter["select"] {
  return (message, values, initial) => {
    const chosen = values.find((value) => value === answer);

    return Promise.resolve(
      message === question && chosen !== undefined ? chosen : initial,
    );
  };
}

function createProject(files: Record<string, string>) {
  const project = createTemporaryProject(files);

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  mockCwd(project.root);

  return project;
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});

  vi.mocked(spawnProcess).mockResolvedValue({
    stdout: "",
    stderr: "",
    status: 0,
    signal: null,
    error: undefined,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
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

    await init({ yes: false });

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

    expect(spawnProcess).not.toHaveBeenCalled();
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

      await init({ yes: false });

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

      expect(JSON.parse(project.read("package.json"))).toEqual({
        ...JSON.parse(packageJson),
        private: true,
        imports: { "#package.json": "./package.json" },
        devEngines: {
          runtime: {
            name: "node",
            version: "24",
            onFail: "error",
          },
        },
      });

      expect(project.read("engrenage.config.ts")).toBe(config);
      expect(spawnProcess).not.toHaveBeenCalled();
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

    await init({ yes: true });

    const packageJson: unknown = JSON.parse(project.read("package.json"));

    expect(packageJson).toMatchObject({
      name: "project",
      version: "0.0.0",
      private: true,
      license: "UNLICENSED",
      author: manifest.author,
      scripts: {
        "ci": "pnpm run ci:check && pnpm run ci:test",
        "ci:check":
          "engrenage sync --check && engrenage typecheck && engrenage eslint",
        "test": "engrenage vitest && engrenage typecheck",
        "typecheck": "engrenage typecheck",
        "coverage": "engrenage vitest:coverage",
        "format": "engrenage prettier",
        "lint": "engrenage eslint",
        "lint:check": "engrenage eslint",
        "lint:fix": "engrenage eslint:fix",
        "lint:suppress": "engrenage eslint:suppress",
        "ready":
          "pnpm install --frozen-lockfile && engrenage sync && pnpm run ci",
      },
      devDependencies: {
        "@vitest/coverage-istanbul":
          manifest.peerDependencies["@vitest/coverage-istanbul"],
        "@auaust/engrenage": `^${manifest.version}`,
        "eslint": manifest.peerDependencies.eslint,
        "prettier": manifest.peerDependencies.prettier,
        "typescript": manifest.devDependencies.typescript,
        "vitest": manifest.peerDependencies.vitest,
        "@changesets/cli": manifest.peerDependencies["@changesets/cli"],
      },
    });

    expect(packageJson).not.toHaveProperty("scripts.build");
    expect(packageJson).not.toHaveProperty("scripts.ci:publish");

    expect(JSON.parse(project.read("tsconfig.json"))).toEqual({
      extends: "@auaust/engrenage/tsconfig/base.json",
      files: [],
      references: [],
    });

    expect(packageJson).toHaveProperty(
      "prettier",
      "@auaust/engrenage/prettier",
    );

    expect(existsSync(project.resolve("prettier.config.ts"))).toBe(false);

    expect(project.read("vitest.config.ts")).toContain(
      "export default defineVitestConfig();",
    );

    expect(spawnProcess).toHaveBeenCalledTimes(3);

    expect(spawnProcess).toHaveBeenNthCalledWith(3, "claude", ["--version"], {
      cwd: project.root,
    });

    expect(spawnProcess).toHaveBeenNthCalledWith(1, "pnpm", ["install"], {
      cwd: project.root,
      stdio: "inherit",
    });

    expect(spawnProcess).toHaveBeenNthCalledWith(
      2,
      "pnpm",
      ["exec", "lefthook", "install"],
      {
        cwd: project.root,
        stdio: "inherit",
      },
    );

    expect(packageJson).toHaveProperty("scripts.prepare", "lefthook install");
    expect(project.read("lefthook.yml")).toContain("$CLAUDECODE");

    expect(console.info).toHaveBeenCalledWith(
      "Run pnpm changeset init to finish the setup.",
    );

    expect(project.read("pnpm-workspace.yaml")).toBe(
      'allowBuilds:\n  "esbuild": true\n  "unrs-resolver": true\nminimumReleaseAgeExclude:\n  - "@auaust/*"\n',
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

  test.each(["Want coverage?", "Test with Vitest?"])(
    "omits the provider and coverage script when declining %s",
    async (declined) => {
      const project = createProject({
        "package.json": '{"name":"project","type":"module"}',
        "engrenage.config.ts":
          "export default { agents: { preferred: [] } };\n",
      });

      const confirm = vi.fn((message: string) => {
        return Promise.resolve(message !== declined);
      });

      vi.spyOn(prompts, "createPrompter").mockReturnValue({
        ...prompts.createPrompter({ yes: true }),
        confirm,
      });

      await init({ yes: false });

      const packageJson: unknown = JSON.parse(project.read("package.json"));

      expect(packageJson).not.toHaveProperty(
        "devDependencies.@vitest/coverage-istanbul",
      );

      expect(packageJson).not.toHaveProperty("scripts.coverage");

      if (declined === "Test with Vitest?") {
        expect(confirm).not.toHaveBeenCalledWith("Want coverage?", true);
      } else {
        expect(packageJson).toHaveProperty("devDependencies.vitest");
      }
    },
  );

  test.each(["dependencies", "devDependencies"])(
    "offers a missing coverage script on re-init with Istanbul in %s",
    async (dependencies) => {
      const project = createProject({
        "package.json": JSON.stringify({
          name: "project",
          type: "module",
          [dependencies]: { "@vitest/coverage-istanbul": "*" },
        }),
        "engrenage.config.ts":
          "export default { agents: { preferred: [] } };\n",
        ".changeset/config.json": "{}\n",
      });

      await init({ yes: true });

      const completed = JSON.parse(project.read("package.json"));

      delete completed.scripts.coverage;

      project.write("package.json", JSON.stringify(completed));

      loadConfig.refresh(project.root);

      vi.clearAllMocks();

      const confirm = vi.fn().mockResolvedValue(true);

      vi.spyOn(prompts, "createPrompter").mockReturnValue({
        ...prompts.createPrompter({ yes: true }),
        confirm,
      });

      await init({ yes: false });

      expect(confirm).toHaveBeenCalledWith("Add the standard scripts?", true);
      expect(confirm).not.toHaveBeenCalledWith("Want coverage?", true);

      expect(JSON.parse(project.read("package.json"))).toMatchObject({
        [dependencies]: { "@vitest/coverage-istanbul": "*" },
        scripts: { coverage: "engrenage vitest:coverage" },
      });

      expect(spawnProcess).not.toHaveBeenCalled();
    },
  );

  test("leaves a complete project untouched", async () => {
    const project = createProject({
      "engrenage.config.ts":
        'export default { agents: { preferred: ["claude"] } };\n',
      "package.json": '{\n  "name": "project",\n  "type": "module"\n}\n',
      ".changeset/config.json": "{}\n",
    });

    await init({ yes: true });

    const completed = project.read("package.json");
    const scratchpad = project.read(".ai/scratchpad.md");

    vi.clearAllMocks();

    await init({ yes: true });

    expect(spawnProcess).not.toHaveBeenCalled();

    expect(console.info).toHaveBeenCalledExactlyOnceWith(
      "Engrenage is set up, nothing is missing.",
    );

    expect(project.read("package.json")).toBe(completed);
    expect(project.read(".ai/scratchpad.md")).toBe(scratchpad);

    expect(keys(JSON.parse(completed))).toEqual([
      "name",
      "version",
      "private",
      "license",
      "author",
      "type",
      "scripts",
      "imports",
      "devDependencies",
      "prettier",
      "devEngines",
    ]);
  });

  test.each([false, true])(
    "starts an uninstalled library with an existing tsconfig: %s",
    async (hasTsconfig) => {
      const project = createTemporaryProject(
        hasTsconfig
          ? {
              "tsconfig.json": JSON.stringify({
                extends: "@auaust/engrenage/tsconfig/library.json",
              }),
              ".gitignore": "node_modules\n\n# Custom output\n/custom-output\n",
              "pnpm-workspace.yaml":
                "# Existing workspace\nallowBuilds:\n  unrs-resolver: true\n",
            }
          : {},
      );

      mockCwd(project.root);

      vi.spyOn(console, "warn").mockImplementation(() => {});

      vi.mocked(spawnProcess).mockImplementation((command, args) => {
        if (args?.[0] === "init") {
          project.write("package.json", '{\n  "type": "module"\n}\n');
        }

        if (args?.[0] === "install") {
          expect(
            existsSync(project.resolve("node_modules/@auaust/engrenage")),
          ).toBe(false);

          expect(parse(project.read("pnpm-workspace.yaml"))).toMatchObject({
            allowBuilds: { "esbuild": true, "unrs-resolver": true },
          });

          linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));
        }

        return Promise.resolve({
          stdout: "",
          stderr: "",
          status: 0,
          signal: null,
          error: undefined,
        });
      });

      await init({ yes: true });

      const name = basename(project.root);

      expect(vi.mocked(spawnProcess).mock.calls).toEqual([
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
        [
          "pnpm",
          ["exec", "lefthook", "install"],
          {
            cwd: project.root,
            stdio: "inherit",
          },
        ],
      ]);

      expect(parse(project.read("lefthook.yml"))).toEqual({
        "pre-commit": {
          commands: {
            "engrenage-local": {
              run: "pnpm --silent engrenage gate --staged --everyone",
            },
          },
        },
      });

      expect(project.read("engrenage.config.ts")).toContain(
        'preset: "library"',
      );

      expect(project.read("engrenage.config.ts")).toContain(
        "attribution: false",
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

      expect(project.read("engrenage.config.ts")).toContain(
        'visibility: "public"',
      );

      expect(JSON.parse(project.read("package.json")).publishConfig).toEqual({
        access: "public",
      });

      expect(existsSync(project.resolve("vite.config.ts"))).toBe(false);
      expect(project.read("tsdown.config.ts")).toContain("defineTsdownConfig");
      expect(project.read("vitest.config.ts")).toContain("defineVitestConfig");

      expect(JSON.parse(project.read("tsconfig.json"))).toEqual({
        extends: "@auaust/engrenage/tsconfig/library.json",
        files: [],
        references: [{ path: "./tsconfig.src.json" }],
      });

      expect(project.read("src/index.ts")).toBe("export {};\n");

      expect(JSON.parse(project.read("tsconfig.src.json"))).toMatchObject({
        extends: "./tsconfig.json",
      });

      expect(existsSync(project.resolve("tsconfig.tests.dist.json"))).toBe(
        false,
      );

      vi.mocked(console.warn).mockClear();

      await sync([], {
        check: true,
        values: {},
      });

      expect(process.exitCode ?? 0).toBe(0);

      expect(console.warn).not.toHaveBeenCalled();

      expect(
        JSON.parse(project.read("package.json")).devEngines.packageManager,
      ).toEqual({
        name: "pnpm",
        version: `^${readTestPnpmVersions().latest}`,
        onFail: "download",
      });

      expect(project.read(".github/workflows/ci.yml")).toContain(
        "pnpm run ci:check",
      );

      expect(project.read(".gitignore")).toContain("# Output\n/dist");
      expect(project.read(".prettierignore")).toContain("# Output\n/dist");

      if (hasTsconfig) {
        expect(project.read(".gitignore")).toContain(
          "# Custom output\n/custom-output",
        );
      }
    },
  );

  test("writes the public visibility and license of a scoped library answering public", async () => {
    const project = createProject({
      "package.json": '{\n  "name": "@scope/library",\n  "type": "module"\n}\n',
    });

    const prompter = {
      ...prompts.createPrompter({ yes: true }),
      select: answerSelect(visibilityQuestion, "public"),
    };

    const select = vi.spyOn(prompter, "select");

    vi.spyOn(prompts, "createPrompter").mockReturnValue(prompter);

    await init({ yes: true });

    expect(select).toHaveBeenCalledWith(
      visibilityQuestion,
      ["public", "private"],
      "private",
    );

    expect(project.read("engrenage.config.ts")).toContain(
      'visibility: "public"',
    );

    expect(JSON.parse(project.read("package.json"))).toMatchObject({
      name: "@scope/library",
      license: "GPL-3.0-only",
      publishConfig: {
        access: "public",
      },
    });
  });

  test("offers public by default to an unscoped library and fails its final sync answering private", async () => {
    const project = createProject({
      "package.json": '{\n  "name": "library",\n  "type": "module"\n}\n',
    });

    const prompter = {
      ...prompts.createPrompter({ yes: true }),
      select: answerSelect(visibilityQuestion, "private"),
    };

    const select = vi.spyOn(prompter, "select");

    vi.spyOn(prompts, "createPrompter").mockReturnValue(prompter);

    await expect(init({ yes: true })).rejects.toThrow(
      "the package library is unscoped",
    );

    expect(select).toHaveBeenCalledWith(
      visibilityQuestion,
      ["public", "private"],
      "public",
    );

    expect(project.read("engrenage.config.ts")).toContain(
      'visibility: "private"',
    );

    expect(JSON.parse(project.read("package.json"))).toMatchObject({
      license: "UNLICENSED",
    });
  });

  test("asks no visibility of an other project", async () => {
    const project = createProject({
      "package.json": '{\n  "name": "project",\n  "type": "module"\n}\n',
    });

    const prompter = {
      ...prompts.createPrompter({ yes: true }),
      select: answerSelect("What kind of project is this?", "other"),
    };

    const select = vi.spyOn(prompter, "select");

    vi.spyOn(prompts, "createPrompter").mockReturnValue(prompter);

    await init({ yes: true });

    expect(select).not.toHaveBeenCalledWith(
      visibilityQuestion,
      expect.anything(),
      expect.anything(),
    );

    expect(project.read("engrenage.config.ts")).not.toContain("visibility");

    expect(JSON.parse(project.read("package.json"))).toMatchObject({
      private: true,
      license: "UNLICENSED",
    });
  });
});

test("renders the role presets of an empty library's config from their contributions", async () => {
  const project = createProject({
    "package.json": '{\n  "name": "library",\n  "type": "module"\n}\n',
  });

  await init({ yes: true });

  expect(project.read("engrenage.config.ts"))
    .toBe(`import { defineConfig } from "@auaust/engrenage/config";
import {
  adapters,
  constants,
  createRolePreset,
  declarations,
  entry,
  enums,
  errors,
  fixtures,
  index,
  ports,
  testsetup,
  types,
  utils,
} from "@auaust/engrenage/roles";

const operations = createRolePreset({ name: "operations", exports: "named-match" });

const roles = [index(), constants(), declarations(), types(), utils(), errors(), enums(), ports(), adapters(), operations()];

const sourceRoles = [...roles, entry()];

export default defineConfig({
  preset: "library",
  visibility: "public",
  src: { baseline: "${findCurrentMonth()}", roles: sourceRoles },
  tests: { roles: [...roles, fixtures(), testsetup()] },
  scripts: { roles },
  tooling: { roles },
  agents: { preferred: [], attribution: false },
});
`);
});

test("does not generate agent setup without selected agents", async () => {
  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": "export default {};\n",
  });

  await init({ yes: true });

  expect(project.read("engrenage.config.ts")).toBe("export default {};\n");

  for (const file of [
    "AGENTS.md",
    "CLAUDE.md",
    "AGENTS.override.md",
    ".claude/settings.json",
    ".codex/hooks.json",
    ".ai/backlog/index.md",
    ".ai/scratchpad.md",
    ".claude/rules/backlog.md",
    ".claude/agents/scratcher.md",
    ".claude/agents/backlogger.md",
  ]) {
    expect(existsSync(project.resolve(file))).toBe(false);
  }

  expect(console.info).toHaveBeenCalledWith(
    expect.stringContaining("Add agents.preferred: []"),
  );
});

test("sets up Codex with backlog guidance without installing coding rules", async () => {
  const input = 'export default { agents: { preferred: ["codex"] } };\n';

  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts": input,
  });

  await init({ yes: true });

  expect(project.read("engrenage.config.ts")).toBe(input);

  expect(project.read("AGENTS.override.md")).toContain(
    "intended for OpenAI Codex",
  );

  expect(project.read("AGENTS.override.md")).toContain(
    "<code>.ai/backlog/*.md</code>",
  );

  expect(project.read(".ai/backlog/index.md")).toContain(
    "No open categories yet.",
  );

  expect(project.read(".codex/hooks.json")).toContain(
    "engrenage agents codex hook github",
  );

  expect(project.read(".agents/skills/scratchpad/SKILL.md")).toContain(
    "# Scratchpad",
  );

  expect(scratchpadPlaceholders).toContain(
    project
      .read(".ai/scratchpad.md")
      .split("<!-- scratchpad-placeholder -->\n")[1]
      ?.trim(),
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
    multiselect(_message, values) {
      return Promise.resolve([...values]);
    },
  });

  await init({ yes: true });

  expect(project.read("engrenage.config.ts")).toBe("export default {};\n");
  expect(project.read("CLAUDE.md")).toBe("@AGENTS.md\n");

  expect(project.read("AGENTS.override.md")).toContain(
    "<code>.ai/backlog/*.md</code>",
  );

  expect(project.read(".claude/settings.json")).toContain(
    "engrenage agents claude hook github",
  );

  expect(project.read(".codex/hooks.json")).toContain(
    "engrenage agents codex hook github",
  );

  expect(console.info).toHaveBeenCalledWith(
    expect.stringContaining('Add agents.preferred: ["claude","codex"]'),
  );
});

test("declining backlog setup leaves no backlog instructions or files", async () => {
  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts":
      'export default { agents: { preferred: ["codex"] } };\n',
  });

  const confirm = vi.fn((message: string) => {
    return Promise.resolve(!message.startsWith("Set up the shared backlog"));
  });

  vi.spyOn(prompts, "createPrompter").mockReturnValue({
    ...prompts.createPrompter({ yes: true }),
    confirm,
  });

  await init({ yes: false });

  expect(confirm).toHaveBeenCalledWith(
    expect.stringContaining("Set up the shared backlog"),
    true,
  );

  expect(existsSync(project.resolve(".ai/backlog/index.md"))).toBe(false);
  expect(existsSync(project.resolve(".claude/rules/backlog.md"))).toBe(false);
  expect(existsSync(project.resolve(".ai/scratchpad.md"))).toBe(false);

  expect(existsSync(project.resolve(".agents/skills/scratchpad"))).toBe(false);

  expect(project.read("AGENTS.md")).not.toContain("## Backlog");

  expect(project.read("AGENTS.override.md")).not.toContain(
    ".claude/rules/backlog.md",
  );
});

test("adds a scratchpad to an existing backlog setup", async () => {
  const project = createProject({
    "package.json": '{"name":"project","type":"module"}',
    "engrenage.config.ts":
      'export default { agents: { preferred: ["codex"] } };\n',
    "AGENTS.md":
      "# Agents\n\n<!-- @reference @auaust/engrenage/agents/sections/backlog.md -->\n<!-- @end -->\n",
    ".ai/backlog/index.md": "# Backlog\n\nKeep project guidance.\n",
    ".claude/rules/backlog.md":
      "<!-- @reference @auaust/engrenage/agents/rules/backlog.md -->\n<!-- @end -->\n",
  });

  await init({ yes: true });

  expect(project.read(".ai/scratchpad.md")).toContain(
    "<!-- scratchpad-placeholder -->",
  );

  expect(project.read(".ai/backlog/index.md")).toBe(
    "# Backlog\n\nKeep project guidance.\n",
  );

  expect(project.read(".agents/skills/scratchpad/SKILL.md")).toContain(
    "# Scratchpad",
  );

  expect(project.read(".agents/skills/backlog-handling/SKILL.md")).toContain(
    "# Backlog handling",
  );

  expect(project.read(".agents/skills/debt-harvesting/SKILL.md")).toContain(
    "# Debt harvesting",
  );
});
