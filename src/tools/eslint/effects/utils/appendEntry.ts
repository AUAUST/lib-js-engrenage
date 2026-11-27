/**
 * Appends `value` to the list `map` holds under `key`, starting that list
 * when it holds none.
 */
export function appendEntry<Key, Value>(
  map: Map<Key, Value[]>,
  key: Key,
  value: Value,
) {
  const list = map.get(key);

  if (list === undefined) {
    map.set(key, [value]);
  } else {
    list.push(value);
  }
}
