import { afterEach, describe, expect, test, vi } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { settleChanges } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createGithubClient } from "#tools/github/issues/api/operations/createGithubClient";
import { fetchGithubSnapshot } from "#tools/github/issues/api/operations/fetchGithubSnapshot";
import { readGithubSnapshot } from "#tools/github/issues/api/operations/readGithubSnapshot";

vi.stubEnv("GH_TOKEN", "t");

const client = await createGithubClient();

vi.unstubAllEnvs();

const api = "https://api.github.com";

function respond(json: unknown, scopes = "repo, read:org") {
  return Promise.resolve(
    new Response(JSON.stringify(json), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "x-oauth-scopes": scopes,
      },
    }),
  );
}

function label(id: number, name: string) {
  return {
    id,
    node_id: `LA_${id}`,
    name,
    description: `${name} label`,
  };
}

const responses: Record<string, unknown> = {
  [`${api}/repos/o/b`]: {
    id: 2,
    node_id: "R_2",
    owner: { login: "o", type: "Organization" },
  },
  [`${api}/repos/o/a`]: {
    id: 1,
    node_id: "R_1",
    owner: { login: "o", type: "Organization" },
  },
  [`${api}/repos/o/b/labels`]: [label(22, "zeta"), label(21, "alpha")],
  [`${api}/repos/o/a/labels`]: [label(11, "bug")],
  [`${api}/orgs/o/issue-types`]: [
    {
      id: 32,
      node_id: "IT_2",
      name: "Task",
      description: null,
      is_enabled: true,
    },
    {
      id: 31,
      node_id: "IT_1",
      name: "Plan",
      description: "A plan",
      is_enabled: false,
    },
  ],
  [`${api}/orgs/o/issue-fields`]: [
    {
      id: 41,
      node_id: "IF_1",
      name: "Priority",
      description: null,
      data_type: "single_select",
      visibility: "all",
      options: [
        {
          id: 52,
          name: "Low",
          description: null,
        },
        {
          id: 51,
          name: "High",
          description: "Urgent",
        },
      ],
    },
  ],
  [`${api}/graphql`]: {
    data: {
      organization: {
        issueTypes: {
          pageInfo: { hasNextPage: false, endCursor: null },
          nodes: [
            { id: "IT_2", pinnedFields: [{ name: "Priority" }] },
            { id: "IT_1", pinnedFields: [] },
          ],
        },
      },
    },
  },
};

function createRegistry() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@o/b",
      repository: "github:o/b",
    }),
  });

  const config = createProjectConfig({
    root: project.root,
    raw: {
      github: {
        repositories: { a: "o/a" },
      },
    },
    configFile: undefined,
  });

  return { project, config };
}

describe("fetchGithubSnapshot", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("snapshots two repositories of one org sorted, with ids, and rewrites nothing on a refetch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => respond(responses[url.replace(/\?.*$/, "")])),
    );

    const { project, config } = createRegistry();

    await fetchGithubSnapshot(config, client);

    await settleChanges(config, { check: false });

    const written = project.read(".engrenage/github.json");

    expect(await readGithubSnapshot(config)).toEqual({
      repositories: {
        a: {
          repository: "o/a",
          id: 1,
          nodeId: "R_1",
          labels: [
            {
              id: 11,
              nodeId: "LA_11",
              name: "bug",
              description: "bug label",
            },
          ],
        },
        b: {
          repository: "o/b",
          id: 2,
          nodeId: "R_2",
          labels: [
            {
              id: 21,
              nodeId: "LA_21",
              name: "alpha",
              description: "alpha label",
            },
            {
              id: 22,
              nodeId: "LA_22",
              name: "zeta",
              description: "zeta label",
            },
          ],
        },
      },
      organizations: {
        o: {
          types: [
            {
              id: 31,
              nodeId: "IT_1",
              name: "Plan",
              description: "A plan",
              enabled: false,
              pinnedFields: [],
            },
            {
              id: 32,
              nodeId: "IT_2",
              name: "Task",
              description: null,
              enabled: true,
              pinnedFields: ["Priority"],
            },
          ],
          fields: [
            {
              id: 41,
              nodeId: "IF_1",
              name: "Priority",
              description: null,
              dataType: "single_select",
              visibility: "all",
              options: [
                {
                  id: 51,
                  name: "High",
                  description: "Urgent",
                },
                {
                  id: 52,
                  name: "Low",
                  description: null,
                },
              ],
            },
          ],
        },
      },
    });

    await fetchGithubSnapshot(config, client);

    expect(config.context.filesystem.changes()).toEqual([]);

    expect(project.read(".engrenage/github.json")).toBe(written);
  });

  test("fails before any metadata read when a classic token lacks read:org", async () => {
    const fetch = vi.fn((url: string) => {
      return respond(responses[url.replace(/\?.*$/, "")], "repo, gist");
    });

    vi.stubGlobal("fetch", fetch);

    const { config } = createRegistry();

    await expect(fetchGithubSnapshot(config, client)).rejects.toThrow(
      "lacks the read:org scope: run `gh auth refresh -s read:org`",
    );

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([`${api}/repos/o/b`]);
  });
});
