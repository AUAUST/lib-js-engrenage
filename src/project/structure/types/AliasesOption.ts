export interface AliasesOption {
  readonly enabled: boolean;
  readonly generated: boolean;
  readonly define: Readonly<Record<string, string>>;
}
