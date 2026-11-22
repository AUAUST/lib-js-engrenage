import { freeze } from "@auaust/toolkit/object";

import type { RecordKind } from "#metalbrain/records/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export const backlogDirectory = ".ai/backlog" satisfies Directory;

export const backlog = freeze({
  name: "backlog",
  location: freeze({ directory: backlogDirectory }),
  fields: freeze({
    title: "text",
    sites: "sites",
    why: "detail",
    want: "detail",
    done: "detail",
  }),
  detailLimit: 3,
  wordCap: "backlogEntry",
} as const) satisfies RecordKind;

export const backlogIndex = `${backlogDirectory}/index.md` satisfies File;

export const legacyBacklogExtension = ".md";

export const backlogReferenceFiles = freeze([
  ".ai/**/*.md",
] as const) satisfies Globs;
