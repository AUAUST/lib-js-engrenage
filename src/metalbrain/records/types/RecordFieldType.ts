/**
 * What a record field holds: `text`, required non-empty prose; `line`, an
 * optional non-empty line of text; `sites`, an optional list of `<path>:<line>`
 * code sites, each naming an existing file; `detail`, optional prose as a text
 * or a list, counted against the kind's `detailLimit`.
 */
export type RecordFieldType = "text" | "line" | "sites" | "detail";
