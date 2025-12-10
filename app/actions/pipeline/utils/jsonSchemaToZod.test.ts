import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { jsonSchemaToZod } from './jsonSchemaToZod';

describe('jsonSchemaToZod', () => {
  it('should convert string schema', () => {
    const schema = { type: 'string', description: 'a string' };
    const zod = jsonSchemaToZod(schema);
    expect(zod).toBeInstanceOf(z.ZodString);
    expect(zod.description).toBe('a string');
    expect(zod.safeParse('test').success).toBe(true);
    expect(zod.safeParse(123).success).toBe(false);
  });

  it('should convert number schema', () => {
    const schema = { type: 'number' };
    const zod = jsonSchemaToZod(schema);
    expect(zod).toBeInstanceOf(z.ZodNumber);
    expect(zod.safeParse(123).success).toBe(true);
    expect(zod.safeParse('123').success).toBe(false);
  });

  it('should convert boolean schema', () => {
    const schema = { type: 'boolean' };
    const zod = jsonSchemaToZod(schema);
    expect(zod).toBeInstanceOf(z.ZodBoolean);
    expect(zod.safeParse(true).success).toBe(true);
  });

  it('should convert object schema', () => {
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name'],
    };
    const zod = jsonSchemaToZod(schema);
    expect(zod).toBeInstanceOf(z.ZodObject);
    
    // json-schema-to-zod typically makes properties optional if not in required array
    // Let's verify parse behavior
    expect(zod.safeParse({ name: 'Alice', age: 30 }).success).toBe(true);
    expect(zod.safeParse({ name: 'Alice' }).success).toBe(true); // age is optional
    expect(zod.safeParse({ age: 30 }).success).toBe(false); // name is required
  });

  it('should convert array schema', () => {
    const schema = {
      type: 'array',
      items: { type: 'string' },
    };
    const zod = jsonSchemaToZod(schema);
    expect(zod).toBeInstanceOf(z.ZodArray);
    expect(zod.safeParse(['a', 'b']).success).toBe(true);
    expect(zod.safeParse([1, 2]).success).toBe(false);
  });

  it('should convert enum schema', () => {
    const schema = {
      type: 'string',
      enum: ['A', 'B'],
    };
    const zod = jsonSchemaToZod(schema);
    // Note: json-schema-to-zod might return ZodEnum or ZodUnion/ZodLiteral depending on implementation
    expect(zod.safeParse('A').success).toBe(true);
    expect(zod.safeParse('C').success).toBe(false);
  });
});
