export function OR(value: any): string {
  return `OR ${value}`
}

export function gratherThan(value): string {
  return ` > ${value}`
}

export function gratherThanOrEqual(value): string {
  return ` >= ${value}`
}

export function Like(value): string {
  return `LIKE ${value}`
}

export function BeginsWith(value: string): string {
  return `STARTSWITH ${value}`
}
