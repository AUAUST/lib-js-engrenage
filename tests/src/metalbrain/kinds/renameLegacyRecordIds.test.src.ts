import { describe, expect, test } from "vitest";
import { parse } from "yaml";

import { createFilesystem } from "#foundation/filesystem/index";
import { backlog } from "#metalbrain/backlog/constants";
import { renameLegacyRecordIds } from "#metalbrain/kinds/index";
import { discarded } from "#metalbrain/logs/constants";
import { findRecord } from "#metalbrain/records/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

describe("renameLegacyRecordIds", () => {
  test("renames every former ID, maps it and rewrites its quotes, keeping one each kind shares", async () => {
    const project = createTemporaryProject({
      ".ai/backlog/tools.yml": "purpose: Tools.\nentries:\n  - id: 261122-8ede\n    title: A claim\n  - id: 261124-a8be\n    title: Shared\n    why: follows 261122-8ede\n",
      ".ai/discarded.yml": "entries:\n  - id: 261124-a8be\n    subject: minisearch\n    need: search\n    reason: heavy\n",
      ".ai/notes.md": "See 261122-8ede and 261124-a8be.\n",
    });

    const filesystem = createFilesystem(project.root);

    const renamed = await renameLegacyRecordIds(filesystem, []);

    await filesystem.flush();

    const [claim = ""] = renamed.get("261122-8ede") ?? [];

    const [
      shared = "",
      sharedDiscarded = "",
    ] = renamed.get("261124-a8be") ?? [];

    expect(claim).toMatch(/^BL-[\da-f]{6}$/u);

    expect(sharedDiscarded).toMatch(/^DS-[\da-f]{6}$/u);

    expect(parse(project.read(".ai/renamed-ids.yml"))).toEqual({
      "261122-8ede": claim,
      "261124-a8be": [shared, sharedDiscarded],
    });

    expect(parse(project.read(".ai/backlog/tools.yml")).entries).toEqual([
      {
        id: claim,
        title: "A claim",
      },
      {
        id: shared,
        title: "Shared",
        why: `follows ${claim}`,
      },
    ]);

    expect(project.read(".ai/notes.md")).toBe(
      `See ${claim} and 261124-a8be.\n`,
    );

    expect((await findRecord(filesystem, discarded, "261124-a8be")).id).toBe(
      sharedDiscarded,
    );

    expect((await findRecord(filesystem, backlog, "261122-8ede")).id).toBe(
      claim,
    );
  });
});
