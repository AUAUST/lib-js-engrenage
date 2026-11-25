// @barrel types
export type * from "#foundation/matching/types/DocumentField";
export type * from "#foundation/matching/types/Matcher";
export type * from "#foundation/matching/types/PreparedDocuments";
export type * from "#foundation/matching/types/PreparedText";
export type * from "#foundation/matching/types/QueryLeaf";
export type * from "#foundation/matching/types/QueryNode";
export type * from "#foundation/matching/types/RankedDocument";
export type * from "#foundation/matching/types/TextWord";
// @end

// @barrel utils
export { createLiteralLeaf } from "#foundation/matching/utils/createLiteralLeaf";
export { createRegexLeaf } from "#foundation/matching/utils/createRegexLeaf";
export { createTextQuery } from "#foundation/matching/utils/createTextQuery";
export { matchTiered } from "#foundation/matching/utils/matchTiered";
export { normalizeText } from "#foundation/matching/utils/normalizeText";
export { prepareDocuments } from "#foundation/matching/utils/prepareDocuments";
export { prepareText } from "#foundation/matching/utils/prepareText";
export { rankDocuments } from "#foundation/matching/utils/rankDocuments";
export { weighLeaf } from "#foundation/matching/utils/weighLeaf";
// @end
