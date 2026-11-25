import { map } from "@auaust/toolkit/iterable";
import { record } from "@auaust/toolkit/object";

import { createGitRepository } from "#tests/utils/createGitRepository";
import { readTestPnpmVersions } from "#tests/utils/readTestPnpmVersions";

export function createGateRepository(
  commands: readonly string[] = ["echo run >> .runs"],
  modules: readonly string[] = ["prettier", "typescript"],
) {
  return createGitRepository(
    {
      "package.json": JSON.stringify({
        name: "project",
        type: "module",
        devDependencies: record(map(modules, (name) => [name, "*"])),
        devEngines: {
          packageManager: {
            name: "pnpm",
            version: `^${readTestPnpmVersions().floor}`,
            onFail: "download",
          },
        },
      }),
      "engrenage.config.ts": `export default { environments: { src: { execution: { syntax: "2026-10" } } }, src: { structure: { purpose: "The code." } }, tooling: { structure: { purpose: "The config." } }, agents: { gate: { commands: ${JSON.stringify(commands)} } } };\n`,
      ".gitignore": "node_modules\n.runs*\n.env.*\n!.env.example\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          strict: true,
          module: "ESNext",
          moduleResolution: "Bundler",
          allowImportingTsExtensions: true,
          noEmit: true,
        },
        files: [],
        references: [
          {
            path: "./tsconfig.src.json",
          },
        ],
      }),
      "tsconfig.src.json": JSON.stringify({
        extends: "./tsconfig.json",
        compilerOptions: {
          tsBuildInfoFile: "./node_modules/.cache/tsconfig/src.tsbuildinfo",
        },
        include: ["src"],
      }),
      "src/index.ts": "export const value: number = 1;\n",
    },
    [...modules, "@types/node"],
  );
}
