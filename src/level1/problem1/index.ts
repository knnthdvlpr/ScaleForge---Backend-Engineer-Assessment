export type Value = string | number | boolean | null | undefined |
  Date | Buffer | Map<unknown, unknown> | Set<unknown> |
  Array<Value> | { [key: string]: Value };

/**
 * Transforms JavaScript scalars and objects into JSON
 * compatible objects.
 * __t = type and __v = value
 */
export function serialize(value: Value): unknown {
  // Handle primitives (null, undefined, string, number, boolean)
  if (value === null || value === undefined) {
    return value;
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  
  // Handle Date
  if (value instanceof Date) {
    return {
      __t: 'Date',
      __v: value.getTime()
    };
  }
  
  // Handle Buffer
  if (Buffer.isBuffer(value)) {
    return {
      __t: 'Buffer',
      __v: Array.from(value)
    };
  }
  
  // Handle Set
  if (value instanceof Set) {
    return {
      __t: 'Set',
      __v: Array.from(value)
    };
  }
  
  // Handle Map
  if (value instanceof Map) {
    return {
      __t: 'Map',
      __v: Array.from(value.entries())
    };
  }
  
  // Handle Array
  if (Array.isArray(value)) {
    return value.map(item => serialize(item as Value));
  }
  
  // Handle plain objects
  if (typeof value === 'object') {
    const result: { [key: string]: unknown } = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = serialize(value[key] as Value);
      }
    }
    return result;
  }
  
  return value;
}

/**
 * Transforms JSON compatible scalars and objects into JavaScript
 * scalar and objects.
 */
export function deserialize<T = unknown>(value: unknown): T {
  // Handle primitives
  if (value === null || value === undefined) {
    return value as T;
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value as T;
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => deserialize(item)) as T;
  }
  
  // Handle objects
  if (typeof value === 'object') {
    const obj = value as { __t?: string; __v?: unknown; [key: string]: unknown };
    
    // Check if it's a special serialized object
    if (obj.__t && obj.__v !== undefined) {
      switch (obj.__t) {
        case 'Date':
          return new Date(obj.__v as number) as T;
        
        case 'Buffer':
          return Buffer.from(obj.__v as number[]) as T;
        
        case 'Set':
          return new Set(obj.__v as unknown[]) as T;
        
        case 'Map':
          return new Map(obj.__v as Array<[unknown, unknown]>) as T;
      }
    }
    
    // Handle plain objects
    const result: { [key: string]: unknown } = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = deserialize(obj[key]);
      }
    }
    return result as T;
  }
  
  return value as T;
}