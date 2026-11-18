import { resolve } from "node:path";

import { readCommit } from "#tools/git/index";
import {
  findRegisteredRepository,
  readOriginRepository,
} from "#tools/github/issues/api/index";
import { resolveLocalCheckout } from "#tools/github/issues/contract/operations/resolveLocalCheckout";
import type { IssueCheckout } from "#tools/github/issues/contract/types/IssueCheckout";
import type { LinkedCheckout } from "#tools/github/issues/contract/types/LinkedCheckout";
import type { Directory } from "#types/Directory";

interface CheckoutRequest {
  readonly short: string;
  readonly directory: Directory;
  readonly ref: string;
  readonly label: string;
}

function parseCheckout(value: string): CheckoutRequest {
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
    label: `\`${value}\``,
  };
}

async function resolveCheckout(
  { short, directory, ref, label }: CheckoutRequest,
  root: Directory,
  registry: ReadonlyMap<string, string>,
): Promise<IssueCheckout> {
  const repository = findRegisteredRepository(registry, short);

  const checkout = resolve(root, directory);

  let commit: string | undefined;

  try {
    commit = await readCommit(checkout, ref);
  } catch (error) {
    throw new Error(`Cannot read the checkout ${label}`, { cause: error });
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

/**
 * The checkouts whose commits an issue check reads: the explicit `requested`
 * ones, then each `linked` checkout at `HEAD` of a repository none of them names,
 * then the local checkout unless one of them names its repository.
 */
export async function resolveIssueCheckouts(
  {
    root,
    repositories,
    linked = {},
  }: {
    root: Directory;
    repositories(): Promise<ReadonlyMap<string, string>>;
    linked?: Readonly<Record<string, LinkedCheckout>> | undefined;
  },
  requested: readonly string[],
): Promise<readonly IssueCheckout[]> {
  const links = Object.entries(linked);

  const [local, registry] = await Promise.all([
    resolveLocalCheckout(root),
    requested.length === 0 && links.length === 0
      ? new Map<string, string>()
      : repositories(),
  ]);

  const explicit = await Promise.all(
    requested.map((value) => {
      return resolveCheckout(parseCheckout(value), root, registry);
    }),
  );

  const named = new Set<string>();

  for (const { repository } of explicit) {
    const key = repository.toLowerCase();

    if (named.has(key)) {
      throw new Error(`Several checkouts name ${repository}: keep one`);
    }

    named.add(key);
  }

  if (local !== undefined) {
    named.add(local.repository.toLowerCase());
  }

  const recorded = await Promise.all(
    links
      .filter(([short]) => {
        return !named.has(
          findRegisteredRepository(registry, short).toLowerCase(),
        );
      })
      .map(([short, { directory }]) => {
        return resolveCheckout(
          {
            short,
            directory,
            ref: "HEAD",
            label: `${directory} linked to ${short}`,
          },
          root,
          registry,
        );
      }),
  );

  const checkouts = [...explicit, ...recorded];

  return local === undefined ||
    explicit.some(({ repository }) => {
      return repository.toLowerCase() === local.repository.toLowerCase();
    })
    ? checkouts
    : [local, ...checkouts];
}
