export interface IssueLookup {
  remember(
    number: number,
    issue: { readonly id: number; readonly type?: string | undefined },
  ): void;
  find(number: number): Promise<{
    readonly id: number;
    readonly type: string | undefined;
  }>;
}
