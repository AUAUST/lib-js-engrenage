// @debt tests `foundation/options` from the mirror directory of `project/config`; the mirror layout checks that a directory exists, not that its tests exercise that domain
import { string } from "valibot";
import { describe, expect, test, vi } from "vitest";

import { listOptionSchema } from "#foundation/options/config/schemas/listOptionSchema";
import { managedListOptionSchema } from "#foundation/options/config/schemas/managedListOptionSchema";
import { resolveListOption } from "#foundation/options/utils/resolveListOption";
import { validate } from "#foundation/options/utils/validate";
import { createTestReporter } from "#tests/utils/createTestReporter";

const defaults = ["a", "b", "c"] as const;

const reporter = createTestReporter();

function getDefaults(): readonly string[] {
  return defaults;
}

describe("resolveListOption", () => {
  test("returns the defaults when the option is omitted or true", () => {
    expect(resolveListOption(undefined, getDefaults, "list", reporter)).toBe(
      defaults,
    );

    expect(resolveListOption(true, getDefaults, "list", reporter)).toBe(
      defaults,
    );
  });

  test("replaces the defaults without computing them", () => {
    const compute = vi.fn(getDefaults);

    expect(resolveListOption(["x"], compute, "list", reporter)).toEqual(["x"]);
    expect(resolveListOption("y", compute, "list", reporter)).toEqual(["y"]);
    expect(resolveListOption(false, compute, "list", reporter)).toBe(false);
    expect(compute).not.toHaveBeenCalled();
  });

  test("excludes, then prepends and appends", () => {
    expect(
      resolveListOption(
        {
          prepend: "x",
          append: ["y", "z"],
          exclude: ["b"],
        },
        getDefaults,
        "list",
        reporter,
      ),
    ).toEqual(["x", "a", "c", "y", "z"]);

    expect(resolveListOption({}, getDefaults, "list", reporter)).toEqual(
      defaults,
    );
  });

  test("warns about duplicates and unmatched exclusions without fixing them", () => {
    const warnings = createTestReporter();

    expect(
      resolveListOption(
        {
          append: "a",
          exclude: "d",
        },
        getDefaults,
        "code.files",
        warnings,
      ),
    ).toEqual(["a", "b", "c", "a"]);

    expect(warnings.messages).toEqual([
      {
        level: "warn",
        text: "code.files excludes d, absent from its defaults",
        data: undefined,
      },
      {
        level: "warn",
        text: "code.files lists a more than once",
        data: undefined,
      },
    ]);
  });
});

describe("list option schemas", () => {
  test("accepts booleans only in managed lists", () => {
    expect(validate(managedListOptionSchema(string()), false, "list")).toBe(
      false,
    );

    expect(() => validate(listOptionSchema(string()), false, "list")).toThrow(
      "Invalid list",
    );

    expect(() => {
      return validate(listOptionSchema(string()), { replace: [] }, "list");
    }).toThrow("Invalid list");
  });
});
