import type { Config } from "@auaust/engrenage/config";

export default async function config(): Promise<Config> {
  return {
    presets: ["library"],
    test: {
      dirs: "test",
    },
    code: {
      generatedFiles: ["src/generated/**"],
    },
  };
}
