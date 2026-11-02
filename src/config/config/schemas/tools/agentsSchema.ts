import {
  array,
  boolean,
  description,
  optional,
  picklist,
  pipe,
  strictObject,
} from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { agentNames } from "#agents/constants";
import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { globsSchema } from "#config/config/schemas/values/globsSchema";

export const preferredSchema = array(picklist(agentNames));

export const agentsSchema = strictObject({
  preferred: optional(
    pipe(
      preferredSchema,
      description(
        join(
          [
            "Agents the project uses (`claude`, `codex`).",
            "`engrenage sync agents` runs only when at least one is listed, and writes their files.",
            "@default none",
          ],
          "\n",
        ),
      ),
    ),
  ),
  instructionFiles: optional(
    pipe(
      globsSchema,
      description(
        join(
          [
            "Globs of the agent instruction files whose `@reference` blocks sync fills.",
            "@default `AGENTS.md` and the Claude and agent rule, skill and sub-agent files",
          ],
          "\n",
        ),
      ),
    ),
  ),
  snippetsDir: optional(
    pipe(
      directorySchema,
      description(
        join(
          [
            "Directory of project snippets that a non-relative `@reference` resolves to before the shared ones of engrenage.",
            "@default none, so only the shared ones resolve",
          ],
          "\n",
        ),
      ),
    ),
  ),
  claudeSettings: optional(
    pipe(
      boolean(),
      description(
        join(
          [
            "Whether `engrenage init` creates `.claude/settings.json` (the edit hook) for a project that prefers Claude.",
            "`false` leaves it alone.",
            "@default created by init, then kept by sync",
          ],
          "\n",
        ),
      ),
    ),
  ),
  codexHooks: optional(
    pipe(
      boolean(),
      description(
        join(
          [
            "Whether sync keeps `.codex/hooks.json` for a project that prefers Codex.",
            "`true` creates it, `false` leaves it alone.",
            "@default kept when the file exists",
          ],
          "\n",
        ),
      ),
    ),
  ),
  attribution: optional(
    pipe(
      boolean(),
      description(
        join(
          [
            "Whether agents credit themselves in commits and pull requests.",
            "It selects the `attribution` or `no-attribution` rule file and the Claude `attribution` setting.",
            "Unset, neither is managed.",
          ],
          "\n",
        ),
      ),
    ),
  ),
});
