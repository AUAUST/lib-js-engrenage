import { readTextFile } from "#foundation/filesystem/index";
import { hasSeparatedIssueReferences } from "#tools/git/index";
import type { File } from "#types/File";
import type { GateReport } from "#workflows/gate/types/GateReport";

const step = "commit message";

export async function runMessageGate(file: File): Promise<GateReport> {
  const message = await readTextFile(file);

  if (message === undefined) {
    return {
      failures: [{ step, output: `Cannot read the commit message: ${file}` }],
      warnings: [],
    };
  }

  return {
    failures: hasSeparatedIssueReferences(message)
      ? [
          {
            step,
            output:
              "Put the Closes and Towards lines on consecutive lines, in a single -m value: each -m starts a new paragraph.",
          },
        ]
      : [],
    warnings: [],
  };
}
