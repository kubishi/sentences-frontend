/**
 * Resolve a $ref path (e.g. "#/$defs/Pronoun") against the root schema.
 */
export function resolveRef(ref, rootSchema) {
  const path = ref.replace('#/', '').split('/');
  let result = rootSchema;
  for (const segment of path) {
    result = result?.[segment];
  }
  return result || null;
}

/**
 * Resolve a schema node: if it has $ref, resolve it and merge siblings.
 */
export function resolveSchema(schema, rootSchema) {
  if (!schema) return schema;
  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, rootSchema);
    const { $ref, ...rest } = schema;
    return { ...resolved, ...rest };
  }
  return schema;
}

/**
 * Extract non-null union variants from an anyOf array.
 * Returns [{name, schema}] with resolved schemas.
 */
export function getUnionVariants(anyOfArray, rootSchema) {
  return anyOfArray
    .filter(item => item.type !== 'null')
    .map(item => {
      const resolved = resolveSchema(item, rootSchema);
      return { name: resolved?.title || 'Unknown', schema: resolved };
    });
}

/**
 * Classify a schema node into a rendering type.
 */
export function classifySchema(schema, rootSchema) {
  if (!schema) return 'unknown';

  // Resolve $ref first
  const resolved = resolveSchema(schema, rootSchema);

  if (resolved.anyOf) {
    const nonNull = resolved.anyOf.filter(item => item.type !== 'null');
    const hasNull = resolved.anyOf.some(item => item.type === 'null');

    if (hasNull && nonNull.length === 1) return 'optional';
    if (nonNull.length > 1) return 'union';
    // Single non-null without null -- resolve and classify the inner schema
    if (nonNull.length === 1) return classifySchema(nonNull[0], rootSchema);
  }

  if (resolved.enum) return 'enum';
  if (resolved.type === 'boolean') return 'boolean';
  if (resolved.type === 'object' && resolved.properties) return 'object';
  if (resolved.type === 'string') return 'string';

  return 'unknown';
}

/**
 * Build a default/empty value for a schema node.
 */
export function buildDefaultValue(schema, rootSchema) {
  if (!schema) return null;

  const resolved = resolveSchema(schema, rootSchema);

  if (resolved.anyOf) {
    const nonNull = resolved.anyOf.filter(item => item.type !== 'null');
    const hasNull = resolved.anyOf.some(item => item.type === 'null');

    // Optional field -- default to null
    if (hasNull && nonNull.length === 1) return null;
    // Union -- default to first variant
    if (nonNull.length >= 1) return buildDefaultValue(nonNull[0], rootSchema);
  }

  if (resolved.type === 'boolean') return false;
  if (resolved.enum) return resolved.enum[0] || '';
  if (resolved.type === 'string') return '';

  if (resolved.type === 'object' && resolved.properties) {
    const obj = {};
    for (const [key, propSchema] of Object.entries(resolved.properties)) {
      obj[key] = buildDefaultValue(propSchema, rootSchema);
    }
    return obj;
  }

  return null;
}

/**
 * Detect which union variant a value currently matches.
 */
export function detectVariant(value, variants) {
  if (value == null) return variants[0]?.name;

  // String value: match against variants with enum arrays
  if (typeof value === 'string') {
    for (const variant of variants) {
      if (variant.schema?.enum?.includes(value)) return variant.name;
    }
    return variants[0]?.name;
  }

  if (typeof value !== 'object') return variants[0]?.name;

  const valueKeys = new Set(Object.keys(value));
  let best = variants[0]?.name;
  let bestScore = -Infinity;

  for (const variant of variants) {
    const props = Object.keys(variant.schema?.properties || {});
    const matchCount = props.filter(p => valueKeys.has(p)).length;
    const extraCount = [...valueKeys].filter(p => !props.includes(p)).length;
    const score = matchCount - extraCount;
    if (score > bestScore) {
      bestScore = score;
      best = variant.name;
    }
  }

  return best;
}

/**
 * Format a schema key or type name as a human-readable label.
 * "tense_aspect" -> "Tense Aspect"
 * "SubjectNoun" -> "Noun"
 * "IntransitiveVerb" -> "Intransitive Verb"
 */
export function formatLabel(key) {
  if (!key) return '';
  // Remove common prefixes for cleaner display
  let label = key
    .replace(/^Subject(?=Noun|Verb)/, '')
    .replace(/^Object(?=Noun)/, '');
  // Split PascalCase
  label = label.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Split snake_case
  label = label.replace(/_/g, ' ');
  // Title case
  return label.replace(/\b\w/g, c => c.toUpperCase()).trim();
}

/**
 * Format an enum value for display.
 * "past_simple" -> "Past Simple"
 */
export function formatEnumValue(val) {
  if (!val) return '';
  return val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
