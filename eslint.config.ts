import { defineEslintConfig } from "#tools/eslint/index";

export default defineEslintConfig({
  boundaries: {
    environments: [
      {
        from: {
 file: { path: ["*.config.ts", "tooling/**"] } 
},
        allow: {
          to: {
 file: { path: ["src/**/index.ts", "src/constants.ts"] } 
},
        },
      },
    ],
  },
});
