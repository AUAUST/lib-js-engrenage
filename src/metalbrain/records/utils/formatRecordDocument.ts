import type { Document } from "yaml";

/**
 * A record group document's file content: lines unwrapped, flow lists unpadded.
 */
export function formatRecordDocument(document: Document): string {
  return document.toString({
    lineWidth: 0,
    flowCollectionPadding: false,
  });
}
