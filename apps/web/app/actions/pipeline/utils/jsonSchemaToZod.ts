import { z } from "zod";
import { JsonSchema, jsonSchemaToZod as jsonSchemaToZodLib } from "json-schema-to-zod";

/**
 * 将 JSON Schema 转换为 Zod Schema
 * 支持基本类型、Object、Array、Enum
 */
export function jsonSchemaToZod(jsonSchema: JsonSchema): z.ZodTypeAny {
  if (!jsonSchema) return z.any();

  try {
    // Generate just the schema string, without imports or exports
    const schemaStr = jsonSchemaToZodLib(jsonSchema);

    // Wrap in a function that accepts 'z' and returns the evaluated schema
    // schemaStr is typically something like "z.object({...})"
    const func = new Function("z", `return ${schemaStr};`);

    return func(z);
  } catch (error) {
    console.error("Failed to convert JSON Schema to Zod:", error);
    // Fallback to any if conversion fails, but log error
    return z.any();
  }
}
