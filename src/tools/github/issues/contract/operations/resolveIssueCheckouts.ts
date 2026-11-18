import { resolve } from "node:path";

import { readCommit } from "#tools/git/index";
import {
  findRegisteredRepository,
  readOriginRepository,
} from "#tools/github/issues/api/index";
import { resolveLocalCheckout } from "#tools/github/issues/contract/operations/resolveLocalCheckout";
import type { IssueCheckout } from "#tools/github/issues/contract/types/IssueCheckout";
import type { Directory } from "#types/Directory";

function parseCheckout(value: string) {
  const separator = value.indexOf("=");
  const location = value.slice(separator + 1);
  const at = location.lastIndexOf("@");
  const directory = at === -1 ? location : location.slice(0, at);
  const reference = at === -1 ? "HEAD" : location.slice(at + 1);

  if (separator <= 0 || directory === "" || reference === "") {
    throw new Error(
      `Expected a checkout as \`<repository>=<directory>[@<ref>]\`, got \`${value}\``,
    );
  }

  return {
    short: value.slice(0, separator),
    directory,
    ref: reference,
  };
}

async function resolveCheckout(
  value: string,
  root: Directory,
  registry: ReadonlyMap<string, string>,
): Promise<IssueCheckout> {
  const { short, directory, ref } = parseCheckout(value);

  const repository = findRegisteredRepository(registry, short);

  const checkout = resolve(root, directory);

  let commit: string | undefined;

  try {
    commit = await readCommit(checkout, ref);
  } catch (error) {
    throw new Error(`Cannot read the checkout \`${value}\``, { cause: error });
  }

  if (commit === undefined) {
    throw new Error(`\`${ref}\` names no commit in ${checkout}`);
  }

  const origin = await readOriginRepository(checkout);

  if (origin?.toLowerCase() !== repository.toLowerCase()) {
    throw new Error(
      `The checkout ${checkout} for ${repository} has ${origin === undefined ? "no GitHub `origin`" : `origin ${origin}`}`,
    );
  }

  return {
    repository,
    root: checkout,
    ref,
  };
}

export async function resolveIssueCheckouts(
  {
    root,
    repositories,
  }: {
    root: Directory;
    repositories(): Promise<ReadonlyMap<string, string>>;
  },
  requested: readonly string[],
): Promise<readonly IssueCheckout[]> {
  const [local, registry] = await Promise.all([
    resolveLocalCheckout(root),
    requested.length === 0 ? new Map<string, string>() : repositories(),
  ]);

  const checkouts = await Promise.all(
    requested.map((value) => resolveCheckout(value, root, registry)),
  );

  const named = new Set<string>();

  for (const { repository } of checkouts) {
    const key = repository.toLowerCase();

    if (named.has(key)) {
      throw new Error(`Several checkouts name ${repository}: keep one`);
    }

    named.add(key);
  }

  return local === undefined || named.has(local.repository.toLowerCase())
    ? checkouts
    : [local, ...checkouts];
}
