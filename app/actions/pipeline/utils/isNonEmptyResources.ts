/**
 * Check if resources is a non-empty object
 */
export function isNonEmptyResources(
  resources: Record<string, { description: string; api: string }> | null | undefined
): resources is Record<string, { description: string; api: string }> {
  return resources !== null && resources !== undefined && Object.keys(resources).length > 0;
}
