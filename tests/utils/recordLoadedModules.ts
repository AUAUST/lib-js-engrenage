import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { isArray } from "@auaust/toolkit/isArray";
import { isString } from "@auaust/toolkit/isString";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

const loadedKey = "__engrenageLoadedModules";

const recorder = `import { registerHooks } from "node:module";

globalThis.${loadedKey} = [];

registerHooks({
  load(url, context, nextLoad) {
    globalThis.${loadedKey}.push(url);

    return nextLoad(url, context);
  },
});
`;

export async function recordLoadedModules(
  script: string,
): Promise<readonly string[]> {
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [
      "--import",
      `data:text/javascript,${encodeURIComponent(recorder)}`,
      "--input-type=module",
      "--eval",
      `${script}\nprocess.stdout.write(JSON.stringify(globalThis.${loadedKey}));\n`,
    ],
    { cwd: repositoryRoot, maxBuffer: 64 * 1024 * 1024 },
  );

  const loaded: unknown = JSON.parse(stdout);

  if (!isArray(loaded) || !loaded.every(isString)) {
    throw new Error(`Expected the loaded module URLs, got ${stdout}`);
  }

  return loaded;
}
