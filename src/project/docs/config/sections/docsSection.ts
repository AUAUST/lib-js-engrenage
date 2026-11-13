import { difference, isNotEmpty, map } from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { docsSchema } from "#project/docs/config/schemas/docsSchema";
import type { ConfigResolver } from "#project/config/index";
import type { TagDeclaration } from "#project/docs/types/TagDeclaration";

async function collectTags(
  config: ConfigResolver,
): Promise<readonly TagDeclaration[]> {
  const contributions = await config.context.registry.contributions(
    "docs.tags",
    config,
  );

  const sets = await Promise.all(
    map(contributions, async ({ entry, extension }) => {
      return {
        source: `${extension.name} (${entry.name})`,
        declarations: await entry.load(),
      };
    }),
  );

  const sources = new Map<string, string>();

  for (const { source, declarations } of sets) {
    for (const { name } of declarations) {
      const known = sources.get(name);

      if (known !== undefined) {
        throw new Error(
          `The doc tag "@${name}" is declared by both ${known} and ${source}`,
        );
      }

      sources.set(name, source);
    }
  }

  return sets.flatMap(({ declarations }) => declarations);
}

function adjustTags(
  contributed: readonly TagDeclaration[],
  {
    append = [],
    exclude = [],
  }: {
    append?: readonly TagDeclaration[];
    exclude?: readonly string[];
  },
): readonly TagDeclaration[] {
  const names = map(contributed, ({ name }) => name);

  const unknown = difference(exclude, names);

  if (isNotEmpty(unknown)) {
    throw new Error(
      `docs.tags excludes ${unknown.join(", ")}, which no active extension declares`,
    );
  }

  const appended = new Map(
    map(append, (declaration) => [declaration.name, declaration] as const),
  );

  const kept = contributed
    .filter(({ name }) => !exclude.includes(name))
    .map((declaration) => {
      return appended.get(declaration.name) ?? declaration;
    });

  const added = append.filter(({ name }) => !names.includes(name));

  return [...kept, ...added];
}

export const docsSection = declareSection({
  declaration: docsSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<{ tags: readonly TagDeclaration[] }> {
    const { tags } = docsSchema.resolve(input, undefined, "docs");

    if (isArray(tags)) {
      return freeze({ tags: freeze([...tags]) });
    }

    const contributed = await collectTags(config);

    return freeze({
      tags: freeze(
        tags === undefined ? [...contributed] : adjustTags(contributed, tags),
      ),
    });
  },
});
