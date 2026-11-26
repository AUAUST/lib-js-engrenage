import { execFileSync } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  ModuleKind,
  ModuleResolutionKind,
  resolveModuleName,
  sys,
} from "typescript";
import { afterEach, describe, expect, test, vi } from "vitest";

import { checkWorkspaces } from "#batiment/structure/index";
import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createProjectLinter } from "#tests/utils/createProjectLinter";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkPackage } from "#tests/utils/linkPackage";

import packageJson from "#package.json" with { type: "json" };

const rootName = "@project/name";

const importer = "extensions/home/src/index.ts";

const placeholder = "{dir}";

const rolesImport = 'import { entry } from "@auaust/engrenage/roles";\n\n';

const config = `${rolesImport}export default {
  environments: { src: { execution: { globals: "node", syntax: 24 } } },
  src: { roles: [entry()] },
  workspaces: { globs: { "extensions/*": { name: "@project/${placeholder}" } } },
};
`;

const uiSources = {
  "src/ui/index.ts": "export const ui: string = 'ui';\n",
  "src/ui/entry.ts": "export { ui } from './index.ts';\n",
  "src/ui/constants.ts": "export const label = 'ui';\n",
  "src/ui/operations/render.ts": "export function render() {}\n",
};

function createFiles(
  dependencies: Readonly<Record<string, string>>,
  sources: Readonly<Record<string, string>> = uiSources,
) {
  return {
    "engrenage.config.ts": config,
    "package.json": JSON.stringify({
      name: rootName,
      type: "module",
      devEngines: packageJson.devEngines,
    }),
    "tsconfig.json": "{}",
    ...sources,
    "extensions/home/.workspace.json": JSON.stringify({
      environments: {
        src: {
          execution: { globals: "node", syntax: 24 },
        },
      },
    }),
    "extensions/home/package.json": JSON.stringify({
      name: "@project/home",
      type: "module",
      dependencies,
    }),
    [importer]: `import { ui } from "${rootName}/ui";\n\nexport const home: string = ui;\n`,
  };
}

function linkRoot(project: ReturnType<typeof createTemporaryProject>) {
  const link = project.resolve(`extensions/home/node_modules/${rootName}`);

  mkdirSync(dirname(link), { recursive: true });

  symlinkSync(project.root, link, "dir");
}

async function createLinkedProject(
  dependencies: Readonly<Record<string, string>>,
  files: Readonly<Record<string, string>> = {},
  {
    sources,
    targets = [],
  }: {
    sources?: Readonly<Record<string, string>>;
    targets?: readonly string[];
  } = {},
) {
  const project = createTemporaryProject({
    ...createFiles(dependencies, sources),
    ...files,
  });

  linkRoot(project);

  const resolved = await loadConfig(project.root);

  await runSync(resolved, {
    names: ["tsconfig", "aliases", ...targets, "package", "workspaces"],
  });

  await resolved.context.filesystem.flush();

  return project;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("workspace imports by package name", () => {
  test("sync exports the root's designed entries to a workspace depending on it", async () => {
    const project = await createLinkedProject({ [rootName]: "workspace:*" });

    expect(JSON.parse(project.read("package.json")).exports).toEqual({
      "./ui": "./src/ui/entry.ts",
      "./ui/constants": "./src/ui/constants.ts",
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
          exports: { "./ui": "./src/ui/entry.ts" },
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

      expect(resolveModule(`${rootName}/ui`)).toBe(
        project.resolve("src/ui/entry.ts"),
      );

      expect(resolveModule(`${rootName}/ui/index`)).toBeUndefined();
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

    expect(resolveModule(`${rootName}/ui`)).toBe(
      pathToFileURL(project.resolve("src/ui/entry.ts")).href,
    );

    expect(() => resolveModule(`${rootName}/ui/index`)).toThrow(
      "ERR_PACKAGE_PATH_NOT_EXPORTED",
    );
  });
});

describe("root environments per runtime in one src namespace", () => {
  const runtimes = {
    "engrenage.config.ts": `${rolesImport}export default {
  environments: {
    src: { dirs: ["src"], execution: { globals: "node", syntax: 24 } },
    admin: { preset: "src", dirs: ["admin"], languages: [{ name: "typescript", options: { tsx: "preact" } }], execution: { globals: "browser", syntax: "2026-10" } },
    storefront: { preset: "src", dirs: ["storefront"], execution: { globals: "browser", syntax: "2026-10" } },
  },
  src: {
    dirs: ["src", "admin", "storefront"],
    roles: [entry(), { name: "widget", file: ["widget.tsx"], public: true, subpath: true }],
  },
  typescript: { tsconfig: { extends: false, compilerOptions: { strict: true, noEmit: true, skipLibCheck: true, allowImportingTsExtensions: true } } },
  workspaces: { globs: { "extensions/*": { name: "@project/${placeholder}" } } },
};
`,
    "node_modules/preact/package.json": JSON.stringify({
      name: "preact",
      type: "module",
      exports: {
        "./jsx-runtime": { types: "./jsx-runtime.d.ts" },
      },
    }),
    "node_modules/preact/jsx-runtime.d.ts": "export namespace JSX {\n  type Element = object;\n  interface IntrinsicElements { div: object }\n}\n\nexport function jsx(): JSX.Element;\n",
    "src/ui/index.ts": "export const ui: string = process.cwd();\n",
    "admin/panel/index.ts": "export const panel = 'panel';\n",
    "admin/panel/entry.ts": "export { panel } from './index.ts';\n",
    "admin/panel/widget.tsx": "export function Widget() {\n  return <div />;\n}\n",
    "storefront/cart/index.ts": "export const cart: string = document.title;\n",
    "storefront/cart/entry.ts": "export { cart } from './index.ts';\n",
  };

  test("sync exports each designed entry, .tsx ones included, and no other module", async () => {
    const project = await createLinkedProject(
      { [rootName]: "workspace:*" },
      runtimes,
    );

    expect(JSON.parse(project.read("package.json")).exports).toEqual({
      "./cart": "./storefront/cart/entry.ts",
      "./panel": "./admin/panel/entry.ts",
      "./panel/widget": "./admin/panel/widget.tsx",
      "./ui": "./src/ui/entry.ts",
      "./ui/constants": "./src/ui/constants.ts",
    });
  });

  test("type-checks each directory under its own environment's settings", async () => {
    const project = await createLinkedProject(
      { [rootName]: "workspace:*" },
      runtimes,
    );

    linkPackage("@types/node", project.resolve("node_modules/@types/node"));

    for (const environment of ["src", "admin", "storefront"]) {
      execFileSync(
        process.execPath,
        [
          fileURLToPath(import.meta.resolve("typescript/bin/tsc")),
          "-p",
          `tsconfig.${environment}.json`,
        ],
        { cwd: project.root, stdio: "pipe" },
      );
    }
  });

  test("the workspace boundary check passes an import of an entry and fails one of another module", async () => {
    const project = await createLinkedProject(
      { [rootName]: "workspace:*" },
      runtimes,
    );

    const synced = await loadConfig(project.root);

    const [resolveImport, grants, entities] = await Promise.all([
      synced.resolve("importResolver"),
      synced.resolve("importGrants"),
      synced.resolve("entities"),
    ]);

    function check(specifier: string, targetFile: string) {
      return checkWorkspaces(
        {
          file: importer,
          importer: entities.entityOf(project.resolve(importer)),
          specifier,
          resolved: resolveImport(specifier, importer),
          targetFile,
          target: entities.entityOf(project.resolve(targetFile)),
          kind: "runtime",
        },
        grants,
      );
    }

    expect(
      check(`${rootName}/panel/widget`, "admin/panel/widget.tsx"),
    ).toBeUndefined();

    expect(
      check(`${rootName}/panel/index`, "admin/panel/index.ts")?.cause,
    ).toBe("unexportedSubpath");
  });

  test("two directories exposing one subpath fail with both files named", async () => {
    const project = createTemporaryProject({
      ...createFiles({}),
      ...runtimes,
      "admin/cart/index.ts": "export const cart = 'cart';\n",
      "admin/cart/entry.ts": "export { cart } from './index.ts';\n",
    });

    const { src } = await (await loadConfig(project.root)).resolve("structure");

    expect(
      src?.diagnostics.filter(({ code }) => code === "shared-specifier"),
    ).toMatchObject([
      {
        blocking: true,
        files: ["admin/cart/entry.ts", "storefront/cart/entry.ts"],
      },
    ]);
  });
});

describe("the root entry of a namespace spanning several directories", () => {
  test("re-exports only the first directory's public domains, while a workspace still resolves another directory's at its subpath", async () => {
    const project = await createLinkedProject(
      {
        [rootName]: "workspace:*",
      },
      {
        "engrenage.config.ts": `${rolesImport}export default {
  environments: {
    src: { dirs: ["src"], execution: { globals: "node", syntax: 24 } },
    admin: { preset: "src", dirs: ["admin"], languages: [{ name: "typescript", options: { tsx: "preact" } }], execution: { globals: "browser", syntax: "2026-10" } },
  },
  src: { dirs: ["src", "admin"], roles: [entry()] },
  workspaces: { globs: { "extensions/*": { name: "@project/${placeholder}" } } },
};
`,
      },
      {
        sources: {
          "src/core/index.ts": "export const core = 'core';\n",
          "src/core/entry.ts": "export { core } from './index.ts';\n",
          "admin/ui/index.ts": "export const ui: string = 'ui';\n",
          "admin/ui/entry.ts": "export { ui } from './index.ts';\n",
        },
        targets: ["barrels"],
      },
    );

    expect(project.read("src/entry.ts")).not.toContain("#ui/");

    expect(JSON.parse(project.read("package.json")).exports).toMatchObject({
      ".": "./src/entry.ts",
      "./ui": "./admin/ui/entry.ts",
    });

    expect(
      resolveModuleName(
        `${rootName}/ui`,
        project.resolve(importer),
        {
          module: ModuleKind.ESNext,
          moduleResolution: ModuleResolutionKind.Bundler,
          noEmit: true,
        },
        sys,
      ).resolvedModule?.resolvedFileName,
    ).toBe(project.resolve("admin/ui/entry.ts"));
  });
});
