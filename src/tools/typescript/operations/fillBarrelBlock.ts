import { createBarrelRenderer } from "#tools/typescript/operations/createBarrelRenderer";
import { planBarrelBlock } from "#tools/typescript/operations/planBarrelBlock";
import type { DirectiveFill } from "#project/config/index";

// @debt a block rendered here cannot read the names a hand-written flat entry spreads, so their collisions surface only in TypeScript
// @debt each block creates its own barrel renderer, loading the `barrels.exports` resolvers again for every block of a run
/**
 * Fills a `@barrel <role>` block with the exports of the role's modules.
 *
 * @throws {Error} The marker does not name a single role.
 */
export const fillBarrelBlock: DirectiveFill = async ({
  args,
  file,
  config,
}) => {
  const [role] = args;

  if (role === undefined || args.length > 1) {
    throw new Error(
      `Expected a single role in the barrel marker of ${file}, got "${args.join(" ")}"`,
    );
  }

  const [plan, render] = await Promise.all([
    planBarrelBlock(config, file, role),
    createBarrelRenderer(config),
  ]);

  const { lines } = await render(plan, new Map());

  return lines.join("\n");
};
