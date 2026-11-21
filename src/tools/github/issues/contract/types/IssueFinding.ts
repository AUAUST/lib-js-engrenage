export interface IssueFinding {
  readonly rule: string;
  readonly message: string;
  readonly severity?: "warning" | undefined;
}
