export function sanitizeDatabaseInput(input: string): string {
  return input.replace(/[^a-zA-Z0-9_]/g, "");
}
