import { configDeclaration } from "#workflows/registry/config/schemas/configDeclaration";

// @debt a one-line module re-exposing `configDeclaration.schema`; its three consumers could read the schema from the declaration

export const configSchema = configDeclaration.schema;
