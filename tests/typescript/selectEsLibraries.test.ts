import { describe, expect, test } from "vitest";

import { includesEsLibrary } from "#typescript/utils/includesEsLibrary";
import { listEsSelections } from "#typescript/utils/listEsSelections";
import { selectEsLibraries } from "#typescript/utils/selectEsLibraries";

const afterEs2021 = [
  "es2023.array",
  "es2023.intl",
  "es2024.collection",
  "es2024.object",
  "es2024.promise",
  "es2024.regexp",
  "es2024.string",
];

describe("selectEsLibraries", () => {
  test("selects the newest qualified edition and the later libs that qualify", () => {
    expect(selectEsLibraries("2026-11")).toEqual(["es2022", ...afterEs2021]);

    expect(selectEsLibraries("2026-10")).toEqual([
      "es2021",
      "es2022.array",
      "es2022.error",
      "es2022.object",
      "es2022.regexp",
      "es2022.string",
      ...afterEs2021,
    ]);
  });

  test("selects the whole newest edition once everything qualifies", () => {
    expect(selectEsLibraries("2028-07")).toEqual(["es2025"]);
  });

  test("selects nothing before the earliest accepted snapshot", () => {
    expect(selectEsLibraries("2022-07")).toBeUndefined();
    expect(listEsSelections()[0]?.from).toBe("2022-08");
  });
});

describe("includesEsLibrary", () => {
  test("includes a lib that is listed or belongs to the base edition", () => {
    const selection = selectEsLibraries("2027-11") ?? [];

    expect(includesEsLibrary(selection, "es2025.float16")).toBe(true);
    expect(includesEsLibrary(["es2025"], "es2025.float16")).toBe(true);

    expect(
      includesEsLibrary(selectEsLibraries("2027-10") ?? [], "es2025.float16"),
    ).toBe(false);
  });
});
