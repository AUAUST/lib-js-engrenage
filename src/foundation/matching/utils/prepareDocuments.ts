import { prepareText } from "#foundation/matching/utils/prepareText";
import type { DocumentField } from "#foundation/matching/types/DocumentField";
import type { PreparedDocuments } from "#foundation/matching/types/PreparedDocuments";

/**
 * `documents` with each of `fields` read and prepared once, ready for any number
 * of rankings and text queries.
 */
export function prepareDocuments<Document>(
  documents: readonly Document[],
  fields: readonly DocumentField<Document>[],
): PreparedDocuments<Document> {
  const texts = documents.map((document) => {
    return fields.map((field) => {
      return prepareText(field.read(document));
    });
  });

  return {
    documents,
    fields,
    texts,
  };
}
