import type { Config } from "@auaust/engrenage/config";

export default async function config(): Promise<Config> {
  return {
    presets: ["library"],
    directories: {
      test: ["test"],
    },
    files: {
      generated: ["src/generated/**"],
    },
  };
}
