export interface DocumentField<Document> {
  readonly name: string;
  readonly weight: number;
  read(document: Document): string;
}
