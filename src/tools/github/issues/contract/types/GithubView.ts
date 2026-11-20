/**
 * A `gh issue view` call parsed from a shell command. `number` and `repository`
 * are `undefined` when the command omits them or passes them in a form the
 * parser cannot read; `fields` lists the `--json` fields, `undefined` for
 * the default view.
 */
export interface GithubView {
  readonly number?: number | undefined;
  readonly repository?: string | undefined;
  readonly fields?: readonly string[] | undefined;
  readonly comments: boolean;
}
