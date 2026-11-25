import type { DocumentField } from "#foundation/matching/types/DocumentField";
import type { PreparedText } from "#foundation/matching/types/PreparedText";

export interface PreparedDocuments<Document> {
  readonly documents: readonly Document[];
  readonly fields: readonly DocumentField<Document>[];
  readonly texts: readonly (readonly PreparedText[])[];
}
