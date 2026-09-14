export interface Case {
  id: string
  note: string
  input: { value?: number; bytes?: string }
  rules: string[]
}

export interface Answer {
  hex?: string
  decodes?: number
  rejects?: boolean
}

export interface Fixture extends Case {
  answer: Answer
}

export interface Mutant {
  rule: string
  reading: string
  fixture: string
  answer: Answer
}

export const fixturesDir: string
export const specPath: string

export function allFixtures(): Fixture[]
export function asks(example: Case): 'bytes' | 'meaning'
export function capabilities(): Record<string, Record<string, string[]>>
export function codecs(): string[]
export function delegated(): string[]
export function fixtureById(id: string): Fixture | undefined
export function loadCases(name: string): { category: string; cases: Case[] }
export function loadCodec(name: string): Fixture[]
export function mutants(): Mutant[]
export function states(answer: Answer): 'bytes' | 'meaning'
