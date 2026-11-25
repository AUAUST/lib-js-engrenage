import { listScopeConfigs } from "#project/workspaces/index";
import { barrelHeader } from "#tools/typescript/constants";
import { createBarrelRenderer } from "#tools/typescript/operations/createBarrelRenderer";
import { isGeneratedBarrel } from "#tools/typescript/operations/isGeneratedBarrel";
import { listBarrelCandidates } from "#tools/typescript/operations/listBarrelCandidates";
import { planBarrels } from "#tools/typescript/operations/planBarrels";
import type { LoadedConfig } from "#project/config/index";
import type { BarrelExport } from "#tools/typescript/types/BarrelExport";
import type { File } from "#types/File";

// @debt the target runs in contribution order within the `generate` stage, so a domain another generator creates after it gets its barrels only on the next sync
// @debt a flat domain with a hand-written entry spreads names the target cannot read, so their collisions surface only in TypeScript
export async function syncBarrelFiles(config: LoadedConfig) {
  const { filesystem } = config.context;

  const rendered = new Map<File, readonly BarrelExport[]>();

  const candidates: File[] = [];

  for (const scoped of await listScopeConfigs(config)) {
    const structure = await scoped.resolve("structure");

    const [plans, render] = await Promise.all([
      planBarrels(scoped, structure),
      createBarrelRenderer(scoped),
    ]);

    for (const plan of plans) {
      const { lines, exports } = await render(plan, rendered);

      rendered.set(plan.file, exports);

      const body = lines.length === 0 ? "export {};" : lines.join("\n");

      await filesystem.write(plan.file, `${barrelHeader}\n\n${body}\n`);
    }

    candidates.push(...(await listBarrelCandidates(filesystem, structure)));
  }

  for (const file of candidates) {
    if (rendered.has(file)) {
      continue;
    }

    if (await isGeneratedBarrel(filesystem, file)) {
      await filesystem.remove(file);
    }
  }
}
