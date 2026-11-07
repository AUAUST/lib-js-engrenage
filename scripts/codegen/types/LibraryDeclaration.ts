export type LibraryDeclaration =
  | { type: "member"; owner: string; name: string }
  | { type: "signature"; owner: string }
  | { type: "value"; name: string };
