type Operator = "=" | "!=" | ((value: unknown) => boolean);

export type Inline = "=" | string;

export type Referenced = Operator | string;
