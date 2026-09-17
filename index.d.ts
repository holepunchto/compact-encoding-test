export interface Case {
  id: string
  note: string
  input: { value?: number; bytes?: string }
  rules: string[]
}

export interface Answer {
  hex?: string
  refused?: boolean
  decodes?: number
  rejects?: boolean
}

export interface Mutant {
  rule: string
  reading: string
  fixture: string
  answer: Answer
}

export const fixturesDir: string
export const specPath: string
