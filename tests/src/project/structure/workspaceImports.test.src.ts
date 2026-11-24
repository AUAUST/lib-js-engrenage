import { execFileSync } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

import {
  ModuleKind,
  ModuleResolutionKind,
  resolveModuleName,
  sys,
} from "typescript";
import { afterEach, describe, expect, test, vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createProjectLinter } from "#tests/utils/createProjectLinter";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

import packageJson from "#package.json" with { type: "json" };

const rootName = "@project/name";

const importer = "extensions/home/src/index.ts";

const placeholder = "{dir}";

const config = `export default {
  environments: { src: { execution: { globals: "node", syntax: 24 } } },
  workspaces: { "extensions/*": { name: "@project/${placeholder}" } },
};
`;

function createFiles(dependencies: Readonly<Record<string, string>>) {
  return {
    "engrenage.config.ts": config,
    "package.json": JSON.stringify({
      name: rootName,
      type: "module",
      devEngines: packageJson.devEngines,
    }),
    "tsconfig.json": "{}",
    "src/ui/index.ts": "export const ui: string = 'ui';\n",
    "src/ui/constants.ts": "export const label = 'ui';\n",
    "src/ui/operations/render.ts": "export function render() {}\n",
    "extensions/home/.workspace.json": "{}",
    "extensions/home/package.json": JSON.stringify({
      name: "@project/home",
      type: "module",
      dependencies,
    }),
    [importer]: `import { ui } from "${rootName}/ui/index";\n\nexport const home: string = ui;\n`,
  };
}

function linkRoot(project: ReturnType<typeof createTemporaryProject>) {
  const link = project.resolve(`extensions/home/node_modules/${rootName}`);

  mkdirSync(dirname(link), { recursive: true });

  symlinkSync(project.root, link, "dir");
}

async function createLinkedProject(
  dependencies: Readonly<Record<string, string>>,
) {
  const project = createTemporaryProject(createFiles(dependencies));

  linkRoot(project);

  const resolved = await loadConfig(project.root);

  await runSync(resolved, { names: ["aliases", "package", "workspaces"] });

  await resolved.context.filesystem.flush();

  return project;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("workspace imports by package name", () => {
  test("sync exports the root's public modules to a workspace depending on it", async () => {
    const project = await createLinkedProject({ [rootName]: "workspace:*" });

    expect(JSON.parse(project.read("package.json")).exports).toEqual({
      "./ui/constants": "./src/ui/constants.ts",
      "./ui/index": "./src/ui/index.ts",
    });
  });

  test("sync exports nothing from a root no workspace depends on", async () => {
    const project = await createLinkedProject({});

    expect(JSON.parse(project.read("package.json")).exports).toBeUndefined();
  });

  test("lint refuses the import without the workspace dependency and passes it with one", async () => {
    async function lint(dependencies: Readonly<Record<string, string>>) {
      const { lint, project } = await createProjectLinter(config, {
        ...createFiles(dependencies),
        "package.json": JSON.stringify({
          name: rootName,
          type: "module",
          exports: { "./ui/index": "./src/ui/index.ts" },
        }),
      });

      linkRoot(project);

      return lint(importer, "import-x/no-extraneous-dependencies");
    }

    expect(await lint({})).toMatchObject([
      { message: expect.stringContaining(`'${rootName}' should be listed`) },
    ]);

    expect(await lint({ [rootName]: "workspace:*" })).toEqual([]);
  });

  test.each([
    ["bundler", ModuleKind.ESNext, ModuleResolutionKind.Bundler],
    ["nodenext", ModuleKind.NodeNext, ModuleResolutionKind.NodeNext],
  ] as const)(
    "TypeScript (%s) resolves an exported module to the root's source and refuses another",
    async (_name, module, moduleResolution) => {
      const project = await createLinkedProject({ [rootName]: "workspace:*" });

      function resolveModule(specifier: string) {
        return resolveModuleName(
          specifier,
          project.resolve(importer),
          {
            module,
            moduleResolution,
            noEmit: true,
          },
          sys,
          undefined,
          undefined,
          ModuleKind.ESNext,
        ).resolvedModule?.resolvedFileName;
      }

      expect(resolveModule(`${rootName}/ui/index`)).toBe(
        project.resolve("src/ui/index.ts"),
      );

      expect(resolveModule(`${rootName}/ui/operations/render`)).toBeUndefined();
    },
  );

  test("Node resolves an exported module to the root's source and refuses another", async () => {
    const project = await createLinkedProject({ [rootName]: "workspace:*" });

    function resolveModule(specifier: string) {
      return execFileSync(
        process.execPath,
        [
          "--input-type=module",
          "--eval",
          `console.log(import.meta.resolve(${JSON.stringify(specifier)}))`,
        ],
        {
          cwd: project.resolve("extensions/home/src"),
          encoding: "utf-8",
          stdio: "pipe",
        },
      ).trim();
    }

    expect(resolveModule(`${rootName}/ui/index`)).toBe(
      pathToFileURL(project.resolve("src/ui/index.ts")).href,
    );

    expect(() => resolveModule(`${rootName}/ui/operations/render`)).toThrow(
      "ERR_PACKAGE_PATH_NOT_EXPORTED",
    );
  });
});
