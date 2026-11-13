import { describe, expect, test } from "vitest";

import { param, see, splitDocTag, stable, throws } from "#project/docs/index";

describe("splitDocTag", () => {
  test.each(["value - text", "value text"])(
    "splits `@param %s` into subject and body",
    (text) => {
      expect(splitDocTag(param(), text)).toStrictEqual({
        ok: true,
        subject: "value",
        body: "text",
      });
    },
  );

  test("splits a type in braces", () => {
    expect(splitDocTag(throws(), "{MyError} when x")).toStrictEqual({
      ok: true,
      type: "MyError",
      body: "when x",
    });
  });

  test.each([
    [see(), "a\nb"],
    [stable(), "now"],
  ])("rejects a body its kind forbids", (declaration, text) => {
    expect(splitDocTag(declaration, text).ok).toBe(false);
  });

  test("splits a type holding characters outside the basic plane", () => {
    expect(splitDocTag(throws(), "{\u{1F600}Error} when x")).toStrictEqual({
      ok: true,
      type: "\u{1F600}Error",
      body: "when x",
    });
  });
});
