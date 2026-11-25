import { renderDebtNote } from "#batiment/structure/utils/renderDebtNote";

export function renderPurpose({
  purpose,
  debt,
}: {
  purpose: string | undefined;
  debt: string | undefined;
}): string {
  return [purpose, renderDebtNote(debt)]
    .filter((part) => part !== undefined)
    .join("  ");
}
