import { rulesDirectory } from "#metalbrain/instructions/constants";
import { listReferenceBlocks } from "#metalbrain/instructions/utils/listReferenceBlocks";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";

export async function getRuleReferences({
  filesystem,
}: {
  filesystem: Filesystem;
}): Promise<ReadonlyMap<string, readonly File[]>> {
  const references = new Map<string, File[]>();

  for (const file of await filesystem.glob(`${rulesDirectory}/**/*.md`)) {
    const content = (await filesystem.read(file)) ?? "";

    for (const { reference } of listReferenceBlocks(content)) {
      references.set(reference, [...(references.get(reference) ?? []), file]);
    }
  }

  return references;
}
