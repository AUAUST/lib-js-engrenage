import { pathToFileURL } from "node:url";

import { loadConfig } from "c12";

import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

let importCount = 0;

async function importNatively(id: string): Promise<unknown> {
  const url = pathToFileURL(id);

  url.search = `_${importCount++}`;

  try {
    return await import(url.href);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);

    throw new Error(
      `Cannot import ${id}: ${message}. Config files load with Node's type stripping: erasable TypeScript only, with explicit extensions on relative imports.`,
      { cause },
    );
  }
}

export async function importConfigFile(directory: Directory, configFile: File) {
  return loadConfig({
    cwd: directory,
    configFile,
    rcFile: false,
    globalRc: false,
    packageJson: false,
    dotenv: false,
    envName: false,
    extend: false,
    giget: false,
    import: importNatively,
  });
}
