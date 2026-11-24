import { isArray, isString } from "@auaust/toolkit";

export function describeRemovedKey(
  key: string,
  value: unknown,
): string | undefined {
  switch (key) {
    case "presets": {
      const [name, ...rest] = isArray(value) ? value : [value];

      return isString(name) && rest.length === 0
        ? `replaced by \`preset: "${name}"\``
        : "replaced by `preset`, which takes one preset name";
    }

    case "source": {
      return 'renamed "src"';
    }

    case "test": {
      return 'renamed "tests"';
    }

    case "code": {
      return "replaced by each environment's `languages`, `tooling.files`, `generated` and `discovered`";
    }

    case "directories":
    case "files": {
      return "replaced by each environment's options";
    }
  }
}
