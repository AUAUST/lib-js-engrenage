export function renderDebtNote(debt: string | undefined): string | undefined {
  return debt === undefined ? undefined : `[debt: ${debt}]`;
}
