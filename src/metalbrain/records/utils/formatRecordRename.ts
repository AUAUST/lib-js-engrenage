/**
 * The line telling a former ID `given` was renamed `id`; `undefined` when
 * `given` is `id` itself.
 */
export function formatRecordRename(
  given: string,
  id: string,
): string | undefined {
  if (given !== id) {
    return `${given} is now ${id}`;
  }
}
