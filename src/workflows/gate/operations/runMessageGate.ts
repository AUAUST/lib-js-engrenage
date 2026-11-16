import { readTextFile } from "#foundation/filesystem/index";
import { commitSubjectLimit } from "#tools/git/constants";
import {
  hasSeparatedIssueReferences,
  readCommitSubject,
} from "#tools/git/index";
import type { GateStepEntry } from "#project/gate/index";
import type { File } from "#types/File";
import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateReport } from "#workflows/gate/types/GateReport";

const step = "commit message";

// @debt the message checks are listed here instead of contributed by the domains owning their conventions, as gate steps are
function listFailures(
  message: string,
  audience: GateStepEntry["audience"],
): string[] {
  const failures: string[] = [];

  const { length } = [...readCommitSubject(message)];

  if (length > commitSubjectLimit) {
    failures.push(
      `Shorten the commit subject to ${commitSubjectLimit} characters (it has ${length}): GitHub cuts a longer first line and moves the rest into the body.`,
    );
  }

  if (audience === "agents" && hasSeparatedIssueReferences(message)) {
    failures.push(
      "Put the Closes and Towards lines on consecutive lines, in a single -m value: each -m starts a new paragraph.",
    );
  }

  return failures;
}

export async function runMessageGate(
  file: File,
  audience: GateStepEntry["audience"],
): Promise<GateReport> {
  const message = await readTextFile(file);

  if (message === undefined) {
    return {
      failures: [{ step, output: `Cannot read the commit message: ${file}` }],
      warnings: [],
    };
  }

  return {
    failures: listFailures(message, audience).map((output): GateFailure => {
      return { step, output };
    }),
    warnings: [],
  };
}
