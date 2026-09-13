export interface Fixture {
  id: string
  note: string
  value?: number
  hex: string
  decodes?: number
  rejects?: boolean
  rules: string[]
}

export interface Mutant {
  rule: string
  reading: string
  fixture: string
  hex?: string
  decodes?: number
}

export const fixturesDir: string
export const specPath: string

export function allFixtures(): Fixture[]
export function capabilities(): Record<string, Record<string, string[]>>
export function codecs(): string[]
export function delegated(): string[]
export function fixtureById(id: string): Fixture | undefined
export function loadCodec(name: string): Fixture[]
export function mutants(): Mutant[]
