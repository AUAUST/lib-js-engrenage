import { afterEach, describe, expect, test, vi } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createGithubClient } from "#tools/github/issues/api/operations/createGithubClient";
import { pruneLabels } from "#tools/github/operations/pruneLabels";
import { syncLabels } from "#tools/github/operations/syncLabels";
import { diffLabels } from "#tools/github/utils/diffLabels";

vi.stubEnv("GH_TOKEN", "t");

const client = await createGithubClient();

vi.unstubAllEnvs();

const color = "f1f3f6";

function createLabelsProject(labels: Record<string, string>) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@o/b",
      repository: "github:o/b",
    }),
  });

  return createProjectConfig({
    root: project.root,
    raw: {
      github: { labels },
    },
    configFile: undefined,
  });
}

function stubFetch() {
  const fetch = vi.fn((_url: string, init?: RequestInit) => {
    const body = init?.method === undefined || init.method === "GET"
      ? [
          {
            name: "cli",
            description: "Commands.",
            color,
          },
        ]
      : {};

    return Promise.resolve(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
  });

  vi.stubGlobal("fetch", fetch);

  return fetch;
}

function methods(fetch: ReturnType<typeof stubFetch>) {
  return fetch.mock.calls.map(([, init]) => {
    return init?.method ?? "GET";
  });
}

describe("diffLabels", () => {
  test("sorts labels into create, update and extra, comparing colors without case", () => {
    expect(
      diffLabels(
        {
          New: { description: "New.", color },
          CLI: { description: "Commands.", color },
          Same: { description: "Same.", color },
        },
        [
          {
            name: "cli",
            description: "Commands.",
            color,
          },
          {
            name: "Same",
            description: "Same.",
            color: "F1F3F6",
          },
          {
            name: "old",
            description: null,
            color,
          },
        ],
      ),
    ).toEqual({
      create: [
        {
          name: "New",
          description: "New.",
          color,
        },
      ],
      update: [
        {
          name: "CLI",
          description: "Commands.",
          color,
          current: "cli",
        },
      ],
      extra: ["old"],
    });
  });
});

describe("syncLabels", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("sends no write with check", async () => {
    const fetch = stubFetch();

    await syncLabels(createLabelsProject({ CLI: "Commands." }), client, {
      check: true,
    });

    expect(methods(fetch)).toEqual(["GET"]);
  });

  test("creates and renames without deleting", async () => {
    const fetch = stubFetch();

    await syncLabels(
      createLabelsProject({ CLI: "Commands.", New: "New." }),
      client,
      { check: false },
    );

    expect(methods(fetch).sort()).toEqual(["GET", "PATCH", "POST"]);
  });

  test("rejects an empty github.labels before any request", async () => {
    const fetch = stubFetch();

    await expect(
      syncLabels(createLabelsProject({}), client, { check: true }),
    ).rejects.toThrow("github.labels is empty");

    await expect(pruneLabels(createLabelsProject({}), client)).rejects.toThrow(
      "github.labels is empty",
    );

    expect(fetch).not.toHaveBeenCalled();
  });
});
