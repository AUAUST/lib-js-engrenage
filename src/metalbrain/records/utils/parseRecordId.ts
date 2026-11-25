const recordIdPattern = /^([A-Z]+)-([\da-f]{6})$/u;

/**
 * The namespace and suffix of a record entry ID: the uppercase namespace its
 * kind declares, a dash, then 6 lowercase hex characters; `undefined` when
 * `value` has another form.
 */
export function parseRecordId(
  value: string,
): { namespace: string; suffix: string } | undefined {
  const [, namespace, suffix] = recordIdPattern.exec(value) ?? [];

  if (namespace !== undefined && suffix !== undefined) {
    return { namespace, suffix };
  }
}
