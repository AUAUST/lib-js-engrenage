import { describe, expect, test } from "vitest";

import { createFilesystem } from "#foundation/filesystem/index";
import {
  addRecord,
  createRecordGroup,
  readRecordGroups,
  type GroupedRecordKind,
} from "#metalbrain/records/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const notes = {
  name: "notes",
  location: {
    directory: ".ai/notes",
  },
  fields: {
    subject: { type: "text", description: "the subject" },
    tried: { type: "detail", description: "what was tried" },
  },
  detailLimit: 1,
  wordCap: "note",
} as const satisfies GroupedRecordKind;

describe("record core", () => {
  test("stores and lists an entry of a kind declaring no storage code", async () => {
    const project = createTemporaryProject({});

    const filesystem = createFilesystem(project.root);

    await createRecordGroup(filesystem, notes, "tools", "Tool notes.");

    const id = await addRecord(
      filesystem,
      notes,
      "tools",
      { subject: "A note", tried: ["one"] },
      { day: new Date("2026-11-22"), wordCap: 50 },
    );

    const [group] = await readRecordGroups(filesystem, notes);

    expect(group).toMatchObject({
      name: "tools",
      kind: "parsed",
      entries: [
        {
          valid: true,
          entry: {
            id,
            subject: "A note",
            tried: "one",
          },
        },
      ],
    });
  });
});
