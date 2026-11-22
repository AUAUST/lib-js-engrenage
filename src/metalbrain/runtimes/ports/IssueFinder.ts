/**
 * The issue a dispatch `brief` names, as its repository and number, or
 * `undefined` when it names none.
 */
export type IssueFinder = (
  brief: string,
) => { repository: string; number: number } | undefined;
