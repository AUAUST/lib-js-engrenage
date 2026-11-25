import { freeze } from "@auaust/toolkit/object";

import {
  recordFileExtension,
  recordIndexName,
} from "#metalbrain/records/constants";
import type { GroupedRecordKind } from "#metalbrain/records/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export const backlogDirectory = ".ai/backlog" satisfies Directory;

export const backlog = freeze({
  name: "backlog",
  namespace: "BL",
  location: freeze({ directory: backlogDirectory }),
  fields: freeze({
    title: freeze({
      type: "text",
      description: "the claim: the problem or need, stated exactly",
    }),
    sites: freeze({
      type: "sites",
      description: "code sites as `<path>:<line>`",
    }),
    why: freeze({ type: "detail", description: "context" }),
    want: freeze({ type: "detail", description: "expected outcome" }),
    done: freeze({
      type: "detail",
      description: "completion or obsolescence condition",
    }),
  }),
  detailLimit: 3,
  wordCap: "backlogEntry",
  search: freeze({
    weights: freeze({
      id: 4,
      title: 3,
      category: 3,
      want: 1.5,
      why: 1,
      done: 1,
      sites: 1,
    }),
    group: "category",
  }),
} as const) satisfies GroupedRecordKind;

export const backlogRecordIndex = `${backlogDirectory}/${recordIndexName}${recordFileExtension}` satisfies File;

export const legacyBacklogIndex = `${backlogDirectory}/index.md` satisfies File;

export const legacyBacklogExtension = ".md";

export const backlogReferenceFiles = freeze([
  ".ai/**/*.md",
] as const) satisfies Globs;

export const scratchpadFile = ".ai/scratchpad.md" satisfies File;

export const scratchpadPlaceholder = "Write ideas, bugs and follow-ups here, one per line; curation turns them into backlog entries and issues.";
