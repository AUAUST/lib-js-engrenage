import { syncBlocks } from "#foundation/blocks/index";
import { typescriptBlocks } from "#tools/typescript/constants";
import { createBarrelRenderer } from "#tools/typescript/operations/createBarrelRenderer";
import { listBarrelCandidates } from "#tools/typescript/operations/listBarrelCandidates";
import { planBarrelBlock } from "#tools/typescript/operations/planBarrelBlock";
import type { LoadedConfig } from "#project/config/index";

// @debt a block rendered here cannot read the names a hand-written flat entry spreads, so their collisions surface only in TypeScript
export async function syncBarrelBlocks(config: LoadedConfig) {
  const { filesystem } = config.context;

  const [files, render] = await Promise.all([
    listBarrelCandidates(config),
    createBarrelRenderer(config),
  ]);

  await Promise.all(
    files.map(async (file) => {
      const content = await filesystem.read(file);

      if (content === undefined) {
        return;
      }

      const synced = await syncBlocks(content, typescriptBlocks, {
        async barrel(...args) {
          const [role] = args;

          if (role === undefined || args.length > 1) {
            throw new Error(
              `Expected a single role in the barrel marker of ${file}, got "${args.join(" ")}"`,
            );
          }

          const plan = await planBarrelBlock(config, file, role);

          const { lines } = await render(plan, new Map());

          return lines.join("\n");
        },
      });

      await filesystem.write(file, synced);
    }),
  );
}
