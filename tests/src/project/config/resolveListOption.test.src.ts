import { string } from "valibot";
import { describe, expect, test, vi } from "vitest";

import { validate } from "#foundation/options/utils/validate";
import { listOptionSchema } from "#project/config/config/schemas/values/listOptionSchema";
import { managedListOptionSchema } from "#project/config/config/schemas/values/managedListOptionSchema";
import { resolveListOption } from "#project/config/operations/resolveListOption";

const defaults = ["a", "b", "c"] as const;

function getDefaults(): readonly string[] {
  return defaults;
}

describe("resolveListOption", () => {
  test("returns the defaults when the option is omitted or true", () => {
    expect(resolveListOption(undefined, getDefaults, "list")).toBe(defaults);
    expect(resolveListOption(true, getDefaults, "list")).toBe(defaults);
  });

  test("replaces the defaults without computing them", () => {
    const compute = vi.fn(getDefaults);

    expect(resolveListOption(["x"], compute, "list")).toEqual(["x"]);
    expect(resolveListOption("y", compute, "list")).toEqual(["y"]);
    expect(resolveListOption(false, compute, "list")).toBe(false);
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
      ),
    ).toEqual(["x", "a", "c", "y", "z"]);

    expect(resolveListOption({}, getDefaults, "list")).toEqual(defaults);
  });

  test("warns about duplicates and unmatched exclusions without fixing them", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(
      resolveListOption(
        {
          append: "a",
          exclude: "d",
        },
        getDefaults,
        "code.files",
      ),
    ).toEqual(["a", "b", "c", "a"]);

    expect(warn).toHaveBeenCalledWith("code.files lists a more than once");

    expect(warn).toHaveBeenCalledWith(
      "code.files excludes d, absent from its defaults",
    );
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
