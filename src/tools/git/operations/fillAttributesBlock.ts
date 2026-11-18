import { flatMap, includes } from "@auaust/toolkit/array";
import { join, map } from "@auaust/toolkit/iterable";

import { anchorGlob } from "#foundation/blocks/index";
import { listLocationGlobs, type DirectiveFill } from "#project/config/index";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

function addAttribute(
  attributes: Map<Glob, string[]>,
  globs: Globs,
  attribute: string,
): void {
  for (const glob of globs) {
    if (glob.startsWith("!") || glob.includes("{")) {
      throw new Error(
        `${glob}: .gitattributes patterns cannot negate or use braces`,
      );
    }

    const existing = attributes.get(glob);

    if (existing === undefined) {
      attributes.set(glob, [attribute]);
    } else if (!includes(existing, attribute)) {
      existing.push(attribute);
    }
  }
}

/**
 * Fills the `# @attributes` block with one line per glob: `linguist-generated`
 * for generated files, `merge=union` for append-only resources and `-diff`
 * for undiffed ones.
 *
 * @throws {Error} The marker has arguments, or a glob negates or uses braces.
 */
export const fillAttributesBlock: DirectiveFill = async ({ args, config }) => {
  if (args.length > 0) {
    throw new Error("Expected no arguments");
  }

  const [
    files,
    resources,
  ] = await Promise.all([config.resolve("files"), config.resolve("resources")]);

  const attributes = new Map<Glob, string[]>();

  addAttribute(attributes, files.generated, "linguist-generated");

  addAttribute(
    attributes,
    flatMap(resources.list({ appendOnly: true }), ({ location }) => {
      return listLocationGlobs(location);
    }),
    "merge=union",
  );

  addAttribute(
    attributes,
    flatMap(resources.list({ diffed: false }), ({ location }) => {
      return listLocationGlobs(location);
    }),
    "-diff",
  );

  return join(
    map(attributes, ([glob, values]) => {
      return `${anchorGlob(glob)} ${values.join(" ")}`;
    }),
    "\n",
  );
};
