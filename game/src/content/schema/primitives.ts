type SchemaRecord = Record<string, unknown>;

export function failSchema(path: string, message: string): never {
  throw new Error(`[schema] ${path}: ${message}`);
}

export function ensureRecord(value: unknown, path: string): SchemaRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    failSchema(path, "expected object");
  }

  return value as SchemaRecord;
}

export function ensureString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    failSchema(path, "expected non-empty string");
  }

  return value;
}

export function ensureNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    failSchema(path, "expected finite number");
  }

  return value;
}

export function ensureBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    failSchema(path, "expected boolean");
  }

  return value;
}

export function ensureArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    failSchema(path, "expected array");
  }

  return value;
}

export function ensureStringArray(value: unknown, path: string): string[] {
  return ensureArray(value, path).map((entry, index) =>
    ensureString(entry, `${path}[${index}]`),
  );
}

export function ensureLiteral<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: string,
): T {
  const text = ensureString(value, path);
  if (!allowed.includes(text as T)) {
    failSchema(path, `expected one of ${allowed.join(", ")}`);
  }

  return text as T;
}

export function ensureOptionalString(value: unknown, path: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return ensureString(value, path);
}

export function ensureOptionalNumber(value: unknown, path: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return ensureNumber(value, path);
}

export function ensureOptionalBoolean(value: unknown, path: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  return ensureBoolean(value, path);
}
