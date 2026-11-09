import { map } from "@auaust/primitive-kit/arrays";
import { record } from "@auaust/toolkit/object";

import { createGitRepository } from "#tests/utils/createGitRepository";

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
      }),
      "engrenage.config.ts": `export default { src: { baseline: "2026-10" }, agents: { gate: { commands: ${JSON.stringify(commands)} } } };\n`,
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
        references: [{ path: "./tsconfig.src.json" }],
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
    modules,
  );
}
