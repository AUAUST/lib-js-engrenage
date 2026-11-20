import { build } from "vite";

import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export async function buildLibraryCode(
  root: Directory,
  entry: File,
): Promise<string> {
  const output = await build({
    root,
    configFile: false,
    logLevel: "silent",
    resolve: {
      tsconfigPaths: true,
    },
    build: {
      write: false,
      lib: {
        entry,
        formats: ["es"],
      },
    },
  });

  const code = [output].flat().flatMap((result) => {
    return "output" in result
      ? result.output.map((chunk) => {
          return "code" in chunk ? chunk.code : "";
        })
      : [];
  });

  return code.join("\n");
}
