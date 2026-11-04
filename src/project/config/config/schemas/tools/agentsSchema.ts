import { boolean } from "valibot";

import { wrap } from "@auaust/primitive-kit/arrays";

import { directorySchema } from "#config/config/schemas/values/directorySchema";
import { globsSchema } from "#config/config/schemas/values/globsSchema";
import { preferredSchema } from "#config/config/schemas/values/preferredSchema";
import { defaultInstructionFiles } from "#config/constants";
import { declare } from "#options/utils/declare";
import { declareObject } from "#options/utils/declareObject";
import { unset } from "#options/utils/unset";

export const agentsSchema = declareObject(
  {
    preferred: declare(preferredSchema, {
      description: [
        "Agents the project uses (`claude`, `codex`).",
        "`engrenage sync agents` runs only when at least one is listed, and writes their files.",
      ],
      optional: { value: undefined },
    }),
    instructionFiles: declare(globsSchema, {
      description:
        "Globs of the agent instruction files whose `@reference` blocks sync fills.",
      optional: { value: defaultInstructionFiles },
      adjust(input) {
        return wrap(input);
      },
    }),
    snippetsDir: declare(directorySchema, {
      description:
        "Directory of project snippets that a non-relative `@reference` resolves to before the shared ones of engrenage.",
      optional: unset("none, so only the shared ones resolve"),
    }),
    claudeSettings: declare(boolean(), {
      description: [
        "Whether `engrenage init` creates `.claude/settings.json` (the edit hook) for a project that prefers Claude.",
        "`false` leaves it alone.",
      ],
      optional: unset("created by init, then kept by sync"),
    }),
    codexHooks: declare(boolean(), {
      description: [
        "Whether sync keeps `.codex/hooks.json` for a project that prefers Codex.",
        "`true` creates it, `false` leaves it alone.",
      ],
      optional: unset("kept when the file exists"),
    }),
    attribution: declare(boolean(), {
      description: [
        "Whether agents credit themselves in commits and pull requests.",
        "It selects the `attribution` or `no-attribution` rule file and the Claude `attribution` setting.",
      ],
      optional: unset("none, so neither is managed"),
    }),
  },
  {
    optional: true,
  },
);
