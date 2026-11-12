import { execFile, execFileSync } from "node:child_process";
import { matchesGlob } from "node:path";
import { promisify } from "node:util";

import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { flatMap } from "@auaust/primitive-kit/arrays";

import { loadConfig } from "#project/config/operations/loadConfig";
import { readEnvironments } from "#project/environments/operations/readEnvironments";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { linkPrettier } from "#tests/utils/linkPrettier";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";
import { mockCwd } from "#tests/utils/mockCwd";
import { createEslintConfig } from "#tools/eslint/operations/createEslintConfig";
import { syncGitignoreFile } from "#tools/git/setup/syncGitignoreFile";

const run = promisify(execFile);

const unformattedScript = "export const a=1\n";

const unformattedStyle = "body{color:red}\n";

interface ThemeOptions {
  readonly layout?: boolean;
}

function createTheme({ layout = true }: ThemeOptions = {}) {
  const project = createTemporaryProject({
    "engrenage.config.ts": 'export default { preset: "shopify-theme" };\n',
    "package.json": JSON.stringify({
      name: "theme",
      type: "module",
      prettier: "@auaust/engrenage/prettier",
      devDependencies: {
        "prettier": "*",
        "@shopify/prettier-plugin-liquid": "*",
      },
    }),
    ".gitignore": "# @ignore project\n# @end\n",
    ...(layout ? { "layout/theme.liquid": "{{ content_for_layout }}\n" } : {}),
    "sections/a.liquid": "<div>{{ a }}</div>\n",
    "snippets/a.liquid": "{%if a%}<p>{{a|upcase}}</p>{%endif%}\n",
    "src/main.ts": "export {};\n",
    "assets/d-x.js": unformattedScript,
    "assets/base.css": unformattedStyle,
    "assets/theme.js": unformattedScript,
  });

  linkPrettier(project.resolve("node_modules/prettier"));

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  mockCwd(project.root);

  return project;
}

function runEngrenage(project: ReturnType<typeof createTheme>, args: string[]) {
  return run(process.execPath, [getExecutable(), ...args], {
    cwd: project.root,
  });
}

function isGitIgnored(project: ReturnType<typeof createTheme>, path: string) {
  try {
    execFileSync("git", ["check-ignore", "--quiet", path], {
      cwd: project.root,
    });

    return true;
  } catch {
    return false;
  }
}

describe("shopify-theme", { timeout: binaryTimeout }, () => {
  test("formats Liquid through the plugin", async () => {
    const project = createTheme();

    await runEngrenage(project, ["prettier", "snippets/a.liquid"]);

    expect(project.read("snippets/a.liquid")).toBe(
      "{% if a %}\n  <p>{{ a | upcase }}</p>\n{% endif %}\n",
    );
  });

  test("ignores Vite's output and keeps the other assets", async () => {
    const project = createTheme();

    const config = await loadConfig(project.root);

    await syncGitignoreFile(config);

    await config.context.filesystem.flush();

    execFileSync("git", ["init", "--quiet"], { cwd: project.root });

    expect(isGitIgnored(project, "assets/d-x.js")).toBe(true);

    expect(isGitIgnored(project, "assets/.vite/manifest.json")).toBe(true);

    expect(isGitIgnored(project, "assets/base.css")).toBe(false);

    await runEngrenage(project, ["prettier", "assets"]);

    expect(project.read("assets/d-x.js")).toBe(unformattedScript);

    expect(project.read("assets/base.css")).not.toBe(unformattedStyle);

    const eslint = new ESLint({
      cwd: project.root,
      overrideConfigFile: true,
      overrideConfig: await createEslintConfig(config),
    });

    expect(await eslint.isPathIgnored("assets/d-x.js")).toBe(true);
    expect(await eslint.isPathIgnored("assets/theme.js")).toBe(false);
  });

  test("ignores no Vite output without a theme layout", async () => {
    const project = createTheme({ layout: false });

    const config = await loadConfig(project.root);

    await syncGitignoreFile(config);

    await config.context.filesystem.flush();

    const ignores = project.read(".gitignore");

    expect(ignores).not.toContain("/assets/d-*");
    expect(ignores).not.toContain("/assets/.vite/**");
  });

  test("leaves the theme directories outside every environment", async () => {
    const project = createTheme();

    const environments = await readEnvironments(await loadConfig(project.root));

    const active = environments.filter(({ environment }) => {
      return environment.active;
    });

    expect(active).not.toHaveLength(0);

    const claimed = flatMap(active, ({ environment }) => {
      return [
        ...environment.dirs.map((directory) => `${directory}/**`),
        ...(environment.globs ?? []),
        ...(environment.rootFiles ?? []),
      ];
    });

    expect(
      claimed.filter((glob) => matchesGlob("sections/a.liquid", glob)),
    ).toEqual([]);
  });
});
