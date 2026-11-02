# Scratchpad

Generating tsconfigs do not format them the same way prettier does. See if an explicit prettier call after sync might help or if it's possible to generate them in a way that is already compatible with prettier. Mismatch:

```json
{
  "compilerOptions": {
    "paths": {
      "@auaust/engrenage/constants": [
        "./src/constants.ts"
      ],
      "@auaust/engrenage": [
        "./src/index.ts",
      ]
    }
  }
}
```

instead of 

```json
{
  "compilerOptions": {
    "paths": {
      "@auaust/engrenage/constants": ["./src/constants.ts"],
      "@auaust/engrenage": ["./src/index.ts"]
    }
  }
}
```
