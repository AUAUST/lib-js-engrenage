import { readTextFile } from "#foundation/filesystem/index";
import { commitSubjectLimit, commitTypes } from "#tools/git/constants";
import { readCommitMessage, type CommitMessage } from "#tools/git/index";
import { listRelatedRecords } from "#workflows/gate/operations/listRelatedRecords";
import type { ResolvedAgents } from "#metalbrain/runtimes/index";
import type { LoadedConfig } from "#project/config/index";
import type { GateStepEntry } from "#project/gate/index";
import type { File } from "#types/File";
import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateReport } from "#workflows/gate/types/GateReport";
import type { GateWarning } from "#workflows/gate/types/GateWarning";

const step = "commit message";

const relatedStep = "related records";

const types: ReadonlySet<string> = new Set(commitTypes);

const typePattern = /^([a-z]+): \S/u;

const generatedSubjectPattern = /^(?:Merge |Revert "|(?:fixup|squash|amend)! )/u;

const referencePattern = /^(?:Closes|Towards) #\d+$/u;

// @debt recognizes only the trailer and line Claude Code writes; another harness's attribution counts as body text, refused whatever `agents.attribution` says
const attributionPatterns = [/^co-authored-by:/iu, /\bgenerated with\b/iu];

function isAttribution(line: string) {
  return attributionPatterns.some((pattern) => pattern.test(line));
}

function listSubjectFailures(subject: string): string[] {
  const type = typePattern.exec(subject)?.[1];

  if (type !== undefined && types.has(type)) {
    return [];
  }

  return [
    `Start the commit subject with \`<type>: \`, the type one of ${commitTypes.join(", ")}.`,
  ];
}

function listBodyFailures(
  body: readonly string[],
  attribution: boolean | undefined,
): string[] {
  const failures: string[] = [];

  const references: number[] = [];

  for (const [index, line] of body.entries()) {
    if (line === "") {
      continue;
    }

    if (referencePattern.test(line)) {
      references.push(index);
    } else if (!isAttribution(line)) {
      failures.push(
        `Keep the commit body to Closes #<n> and Towards #<n> lines; remove: ${line}`,
      );
    } else if (attribution === false) {
      failures.push(
        `Remove the attribution line, since agents.attribution is false: ${line}`,
      );
    }
  }

  const first = references.at(0);
  const last = references.at(-1);

  if (
    first !== undefined &&
    last !== undefined &&
    last - first + 1 !== references.length
  ) {
    failures.push(
      "Put the Closes and Towards lines on consecutive lines, in a single -m value: each -m starts a new paragraph.",
    );
  }

  return failures;
}

// @debt the message checks are listed here instead of contributed by the domains owning their conventions, as gate steps are
// @debt the agents' checks apply the git rule's conventions whether or not the project installs that rule
function listFailures(
  { subject, body }: CommitMessage,
  { audience, attribution }: MessageGateOptions,
): string[] {
  const failures: string[] = [];

  const { length } = [...subject];

  if (length > commitSubjectLimit) {
    failures.push(
      `Shorten the commit subject to ${commitSubjectLimit} characters (it has ${length}): GitHub cuts a longer first line and moves the rest into the body.`,
    );
  }

  if (audience === "everyone" || generatedSubjectPattern.test(subject)) {
    return failures;
  }

  return [
    ...failures,
    ...listSubjectFailures(subject),
    ...listBodyFailures(body, attribution),
  ];
}

interface MessageGateOptions {
  readonly audience: GateStepEntry["audience"];
  /**
   * `agents.attribution`: `false` refuses attribution lines, any other
   * value accepts them.
   */
  readonly attribution?: ResolvedAgents["attribution"];
  /**
   * The loaded config, to warn about the backlog entries the commit may relate
   * to; no warning without it.
   */
  readonly config?: LoadedConfig;
}

async function listWarnings(
  message: CommitMessage,
  config: LoadedConfig | undefined,
): Promise<GateWarning[]> {
  if (config === undefined) {
    return [];
  }

  try {
    const lines = await listRelatedRecords(config, message);

    return lines.length === 0
      ? []
      : [{ step: relatedStep, output: lines.join("\n") }];
  } catch (error) {
    return [
      {
        step: relatedStep,
        output: `Cannot list the related records: ${error instanceof Error ? error.message : String(error)}`,
      },
    ];
  }
}

export async function runMessageGate(
  file: File,
  options: MessageGateOptions,
): Promise<GateReport> {
  const message = await readTextFile(file);

  if (message === undefined) {
    return {
      failures: [{ step, output: `Cannot read the commit message: ${file}` }],
      warnings: [],
    };
  }

  const commit = readCommitMessage(message);

  return {
    failures: listFailures(commit, options).map((output): GateFailure => {
      return { step, output };
    }),
    warnings: await listWarnings(commit, options.config),
  };
}
