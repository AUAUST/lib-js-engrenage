export interface RankedDocument<Document> {
  readonly document: Document;
  readonly score: number;
  readonly similarity: number;
}
