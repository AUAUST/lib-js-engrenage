import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const exported = "export const value = 1;\n";

export function createBoundaryProject() {
  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: {
        "#entry": "./src/entry.ts",
        "#foundation/*": "./src/foundation/*.ts",
        "#project/*": "./src/project/*.ts",
      },
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { namespaces: { ".": { layers: ["foundation", "project"] } } } };\n`,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        allowImportingTsExtensions: true,
        noEmit: true,
      },
    }),
    "tests/helper.ts": exported,
    "src/foundation/base/index.ts": exported,
    "src/foundation/base/adapters/impl.ts": exported,
    "src/project/feature/index.ts": exported,
    "src/project/feature/utils/own.ts": exported,
    "src/project/feature/inner/index.ts": exported,
    "src/project/feature/inner/utils/deep.ts": exported,
    "src/project/other/index.ts": exported,
    "src/project/other/entry.ts": exported,
    "src/entry.ts": exported,
    "src/project/other/utils/priv.ts": exported,
    "src/project/other/constants.ts": exported,
  });
}
