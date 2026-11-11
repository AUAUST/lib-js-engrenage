import { RequestError } from "@octokit/request-error";
import {
  array,
  boolean,
  nullable,
  nullish,
  number,
  object,
  optional,
  string,
} from "valibot";

import { map, sort } from "@auaust/primitive-kit/arrays";
import { record } from "@auaust/toolkit/object";

import { validate } from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import { scopesHeader } from "#tools/github/issues/api/constants";
import { checkTokenScopes } from "#tools/github/issues/api/utils/checkTokenScopes";
import { splitRepository } from "#tools/github/issues/api/utils/splitRepository";
import type { ConfigResolver } from "#project/config/index";
import type { GithubClient } from "#tools/github/issues/api/types/GithubClient";
import type { GithubSnapshot } from "#tools/github/issues/api/types/GithubSnapshot";

type RepositorySnapshot = GithubSnapshot["repositories"][string];

type OrganizationSnapshot = GithubSnapshot["organizations"][string];

const repositorySchema = object({
  id: number(),
  node_id: string(),
  owner: object({ login: string(), type: string() }),
});

const entityInput = {
  id: number(),
  node_id: string(),
  name: string(),
  description: nullish(string(), null),
};

const labelsSchema = array(object(entityInput));

const typesSchema = array(object({ ...entityInput, is_enabled: boolean() }));

const fieldsSchema = array(
  object({
    ...entityInput,
    data_type: string(),
    visibility: optional(string()),
    options: nullish(
      array(
        object({
          id: number(),
          name: string(),
          description: nullish(string(), null),
        }),
      ),
      [],
    ),
  }),
);

const pinnedFieldsSchema = object({
  organization: object({
    issueTypes: object({
      pageInfo: object({
        hasNextPage: boolean(),
        endCursor: nullable(string()),
      }),
      nodes: array(
        object({
          id: string(),
          pinnedFields: nullish(array(object({ name: string() })), []),
        }),
      ),
    }),
  }),
});

const pinnedFieldsQuery = `query ($login: String!, $after: String) {
  organization(login: $login) {
    issueTypes(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        pinnedFields {
          ... on IssueFieldDate { name }
          ... on IssueFieldMultiSelect { name }
          ... on IssueFieldNumber { name }
          ... on IssueFieldSingleSelect { name }
          ... on IssueFieldText { name }
        }
      }
    }
  }
}`;

interface Reader {
  readonly client: GithubClient;
  readonly fineGrained: boolean;
}

function toEntity<
  Input extends { readonly id: number; readonly node_id: string },
>({ id, node_id, ...rest }: Input) {
  return {
    id,
    nodeId: node_id,
    ...rest,
  };
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function sortByName<Item extends { readonly name: string }>(
  items: Item[],
): Item[] {
  return sort(items, (a, b) => compareText(a.name, b.name));
}

function sortByKey<Value>(items: (readonly [string, Value])[]) {
  return record(sort(items, ([a], [b]) => compareText(a, b)));
}

function denyPermission(error: unknown, permission: string): never {
  if (
    error instanceof RequestError &&
    (error.status === 403 || error.status === 404)
  ) {
    throw new Error(
      `${error.message}: a fine-grained token needs read access to ${permission}`,
      { cause: error },
    );
  }

  throw error;
}

async function read<Data>(
  { fineGrained }: Reader,
  permission: string,
  request: () => Promise<Data>,
): Promise<Data> {
  try {
    return await request();
  } catch (error) {
    if (fineGrained) {
      denyPermission(error, permission);
    }

    throw error;
  }
}

async function openReader(
  client: GithubClient,
  repository: string,
): Promise<{ reader: Reader; data: unknown }> {
  const permission = `the "Metadata" repository permission on ${repository}`;

  try {
    const { data, headers } = await client.request(
      "GET /repos/{owner}/{repo}",
      splitRepository(repository),
    );

    const scopes = headers[scopesHeader];

    if (scopes !== undefined) {
      checkTokenScopes(String(scopes));
    }

    return {
      reader: { client, fineGrained: scopes === undefined },
      data,
    };
  } catch (error) {
    const scopes = error instanceof RequestError
      ? error.response?.headers[scopesHeader]
      : undefined;

    if (scopes !== undefined) {
      checkTokenScopes(String(scopes));

      throw error;
    }

    return denyPermission(error, permission);
  }
}

async function readRepository(
  reader: Reader,
  repository: string,
  data?: unknown,
) {
  const route = splitRepository(repository);

  const [details, labels] = await Promise.all([
    data === undefined
      ? read(
          reader,
          `the "Metadata" repository permission on ${repository}`,
          async () => {
            const response = await reader.client.request(
              "GET /repos/{owner}/{repo}",
              route,
            );

            return response.data;
          },
        )
      : data,
    read(reader, `the "Issues" repository permission on ${repository}`, () => {
      return reader.client.paginate("GET /repos/{owner}/{repo}/labels", route);
    }),
  ]);

  const {
    id,
    node_id,
    owner,
  } = validate(repositorySchema, details, `repository ${repository}`);

  const snapshot: RepositorySnapshot = {
    repository,
    id,
    nodeId: node_id,
    labels: sortByName(
      map(validate(labelsSchema, labels, `labels of ${repository}`), toEntity),
    ),
  };

  return { snapshot, owner };
}

// @debt a GraphQL error from a fine-grained token lacking a permission surfaces as is, without naming the permission as the REST reads do
async function readPinnedFields(
  client: GithubClient,
  login: string,
): Promise<ReadonlyMap<string, string[]>> {
  const pinned = new Map<string, string[]>();

  let after: string | null = null;

  do {
    const response: unknown = await client.graphql(pinnedFieldsQuery, {
      login,
      after,
    });

    const { pageInfo, nodes } = validate(
      pinnedFieldsSchema,
      response,
      `pinned fields of ${login}`,
    ).organization.issueTypes;

    for (const { id, pinnedFields } of nodes) {
      pinned.set(
        id,
        sort(
          map(pinnedFields, ({ name }) => name),
          compareText,
        ),
      );
    }

    after = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  } while (after !== null);

  return pinned;
}

async function readOrganization(
  reader: Reader,
  login: string,
): Promise<OrganizationSnapshot> {
  const [types, fields, pinned] = await Promise.all([
    read(
      reader,
      `the "Issue Types" organization permission on ${login}`,
      () => {
        return reader.client.paginate("GET /orgs/{org}/issue-types", {
          org: login,
        });
      },
    ),
    read(
      reader,
      `the "Issue Fields" organization permission on ${login}`,
      () => {
        return reader.client.paginate("GET /orgs/{org}/issue-fields", {
          org: login,
        });
      },
    ),
    readPinnedFields(reader.client, login),
  ]);

  return {
    types: sortByName(
      map(
        validate(typesSchema, types, `issue types of ${login}`),
        ({ is_enabled, ...type }) => {
          return {
            ...toEntity(type),
            enabled: is_enabled,
            pinnedFields: pinned.get(type.node_id) ?? [],
          };
        },
      ),
    ),
    fields: sortByName(
      map(
        validate(fieldsSchema, fields, `issue fields of ${login}`),
        ({ data_type, options, ...field }) => {
          return {
            ...toEntity(field),
            dataType: data_type,
            // @debt sorting options and pinned fields by name drops GitHub's order, the option priority and the pinned order, which the planning sheet may need
            options: sortByName(options),
          };
        },
      ),
    ),
  };
}

async function readOrganizations(
  reader: Reader,
  owners: ReadonlyMap<string, string>,
) {
  const organizations = [...owners].filter(([login, type]) => {
    if (type === "Organization") {
      return true;
    }

    console.info(
      `${login} is a personal account: its repositories get no issue types or fields`,
    );

    return false;
  });

  return Promise.all(
    organizations.map(async ([login]) => {
      return [login, await readOrganization(reader, login)] as const;
    }),
  );
}

export async function fetchGithubSnapshot(
  config: ConfigResolver,
  client: GithubClient,
): Promise<void> {
  const { repositories } = await config.resolve("github");

  const registered = [...(await repositories())];

  const opened = registered[0] === undefined
    ? undefined
    : await openReader(client, registered[0][1]);

  const reader = opened?.reader ?? { client, fineGrained: false };

  const fetched = await Promise.all(
    registered.map(async ([short, repository], index) => {
      const data = index === 0 ? opened?.data : undefined;

      return [short, await readRepository(reader, repository, data)] as const;
    }),
  );

  const owners = new Map<string, string>();

  for (const [, { owner }] of fetched) {
    owners.set(owner.login, owner.type);
  }

  const snapshot: GithubSnapshot = {
    repositories: sortByKey(
      map(fetched, ([short, { snapshot: repository }]) => {
        return [short, repository] as const;
      }),
    ),
    organizations: sortByKey(await readOrganizations(reader, owners)),
  };

  const resources = await config.resolve("resources");

  await config.context.filesystem.write(
    resources.path("state.github"),
    `${JSON.stringify(snapshot, undefined, jsonIndentation.tabSize)}\n`,
  );
}
