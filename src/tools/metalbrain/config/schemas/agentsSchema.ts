import { array, boolean, picklist, string } from "valibot";

import { toArray } from "@auaust/toolkit/array";

import {
  declare,
  declareObject,
  directorySchema,
  globsSchema,
  unset,
} from "#foundation/options/index";
import {
  defaultOutputLimit,
  defaultWordCapMode,
  defaultWordCaps,
  wordCapModes,
} from "#metalbrain/facts/constants";
import { subagentCacheTtls } from "#metalbrain/runtimes/constants";
import {
  defaultInstructionFiles,
  defaultSubagentCacheTtl,
} from "#tools/agents/constants";
import { limitSchema } from "#tools/metalbrain/config/schemas/limitSchema";
import { preferredSchema } from "#tools/metalbrain/config/schemas/preferredSchema";
import { codexRemoval } from "#tools/metalbrain/constants";

export const agentsSchema = declareObject(
  {
    preferred: declare(preferredSchema, {
      description: [
        "Agents the project uses (`claude`).",
        "`engrenage sync agents` runs only when at least one is listed, and writes their files.",
      ],
      optional: { value: undefined },
    }),
    instructionFiles: declare(globsSchema, {
      description: "Globs of the agent instruction files whose `@reference` blocks sync fills.",
      optional: { value: defaultInstructionFiles },
      adjust(input) {
        return toArray(input);
      },
    }),
    snippetsDir: declare(directorySchema, {
      description: "Directory of project snippets that a non-relative `@reference` resolves to before the shared ones of engrenage.",
      optional: unset("none, so only the shared ones resolve"),
    }),
    claudeSettings: declare(boolean(), {
      description: [
        "Whether `engrenage init` creates `.claude/settings.json` (hooks, permissions and attribution) for a project that prefers Claude.",
        "`false` leaves it alone.",
      ],
      optional: unset("created by init, then kept by sync"),
    }),
    attribution: declare(boolean(), {
      description: [
        "Whether agents credit themselves in commits and pull requests.",
        "It selects the `attribution` or `no-attribution` rule file and the Claude `attribution` setting.",
      ],
      optional: unset("none, so neither is managed"),
    }),
    subagentCacheTtl: declare(picklist(subagentCacheTtls), {
      description: [
        "Prompt cache lifetime of subagent requests, written to Claude's `subagentPromptCacheTtl` setting.",
        "`1h` keeps a subagent's cache across pauses over five minutes, at a higher write cost.",
      ],
      optional: { value: defaultSubagentCacheTtl },
    }),
    outputLimit: declare(limitSchema, {
      description: [
        "Characters of a shell command's output past which the Claude PostToolUse hook asks the agent to bound its output.",
        "An output stays in context and is read again by every later call of the session.",
      ],
      optional: { value: defaultOutputLimit },
    }),
    gate: declareObject(
      {
        commands: declare(array(string()), {
          description: "Shell commands the gate runs from the project root alongside its built-in checks.",
          optional: { value: [] },
        }),
        hook: declare(boolean(), {
          description: [
            "Whether `engrenage init` creates the lefthook pre-commit command that runs `engrenage gate --staged` for agent commits, and sync keeps it while `lefthook.yml` exists.",
            "`false` leaves it alone.",
          ],
          optional: unset("created by init, then kept by sync"),
        }),
      },
      {
        description: "The gate that fixes and checks the files an agent changed (`engrenage gate`).",
        optional: true,
      },
    ),
    wordCaps: declareObject(
      {
        mode: declare(picklist(wordCapModes), {
          description: "`warn` reports a text over its word cap to the agent; `deny` also blocks the GitHub write it would make. The gate only ever warns.",
          optional: { value: defaultWordCapMode },
        }),
        goal: declare(limitSchema, {
          description: "Words of the **Goal** section of an issue.",
          optional: { value: defaultWordCaps.goal },
        }),
        context: declare(limitSchema, {
          description: "Words of the **Context** section of an issue.",
          optional: { value: defaultWordCaps.context },
        }),
        doneWhen: declare(limitSchema, {
          description: "Words of the **Done when** section of an issue.",
          optional: { value: defaultWordCaps.doneWhen },
        }),
        comment: declare(limitSchema, {
          description: "Words of a whole issue comment.",
          optional: { value: defaultWordCaps.comment },
        }),
        backlogEntry: declare(limitSchema, {
          description: "Words of the prose of one entry of `.ai/backlog/*.yml`.",
          optional: { value: defaultWordCaps.backlogEntry },
        }),
        logEntry: declare(limitSchema, {
          description: "Words of one friction, discarded or pending entry, written through `metalbrain friction|discarded|pending add`.",
          optional: { value: defaultWordCaps.logEntry },
        }),
      },
      {
        description: [
          "Word caps of prose only, checked before `gh` writes issues and comments, by the `backlog` sync check for backlog entries, and by every record write.",
          "Sections such as **Prerequisites** and **Tests** have no word cap.",
        ],
        optional: true,
      },
    ),
  },
  {
    optional: true,
    renamed: { budgets: "wordCaps" },
    removed: { codexHooks: codexRemoval },
  },
);
