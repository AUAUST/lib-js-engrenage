export default async function config() {
  return {
    preset: "library",
    tests: {
      dirs: "test",
    },
    src: {
      generated: ["generated/**"],
    },
  };
}
