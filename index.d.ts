export interface Fixture {
  id: string
  note: string
  value?: number
  hex: string
  decodes?: number
  rejects?: boolean
  rules: string[]
}

export const capabilities: Record<string, Record<string, string[]>>
export const delegated: string[]
export const fixturesDir: string
export const specPath: string

export function loadCodec(name: string): Fixture[]
