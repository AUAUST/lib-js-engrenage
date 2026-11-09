import { array, boolean, exactOptional, is, object, string } from "valibot";

import type { Resolver } from "#foundation/options/index";
import type { ConfigContext } from "#project/config/index";
import type { ResolvedEnvironment } from "#project/environments/ports/ResolvedEnvironment";

const globs = exactOptional(array(string()));

const resolvedEnvironment = object({
  active: boolean(),
  dirs: array(string()),
  globs,
  generated: globs,
  discovered: globs,
  rootFiles: globs,
});

export async function readEnvironment(
  config: Resolver<ConfigContext>,
  name: string,
): Promise<ResolvedEnvironment> {
  const resolved = await config.resolve(name);

  if (!is(resolvedEnvironment, resolved)) {
    throw new Error(
      `Config key "${name}" resolves to no environment: it lacks a boolean \`active\` or a \`dirs\` list, or holds a \`globs\`, \`generated\`, \`discovered\` or \`rootFiles\` that is not a list`,
    );
  }

  return resolved;
}
