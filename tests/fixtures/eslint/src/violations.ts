export default function violations(value: boolean, count: number | null) {
  if (value) return 1;

  if (count == null) {
    return 0;
  }

  return count == 1 ? 1 : 0;
}
