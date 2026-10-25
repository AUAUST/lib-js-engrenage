import type { Config } from "@auaust/engrenage/config";

export default {
  directories: {
    test: ["test"],
  },
  files: {
    generated: ["src/generated/**"],
  },
} satisfies Config;
