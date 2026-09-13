const test = require('brittle')
const corpus = require('..')
const { rules } = require('../lib/spec')

const HEX = /^([0-9a-f][0-9a-f])*$/
const OUTCOMES = ['hex', 'decodes', 'rejects']

test('mutants exist', (t) => {
  t.ok(corpus.mutants().length > 0, 'the corpus carries mutants')
})

test('every mutant names a rule the specification states', (t) => {
  const known = new Set(rules().map((rule) => rule.slug))
  const unknown = corpus.mutants().filter((mutant) => !known.has(mutant.rule))

  t.alike(
    unknown.map((mutant) => mutant.rule),
    [],
    'no mutant names a rule that does not exist'
  )
})

test('every mutant is aimed at a fixture that exercises its rule', (t) => {
  const misaimed = []

  for (const mutant of corpus.mutants()) {
    const fixture = corpus.fixtureById(mutant.fixture)
    if (!fixture) {
      misaimed.push(`${mutant.rule}: names an unknown fixture ${mutant.fixture}`)
    } else if (!fixture.rules.includes(mutant.rule)) {
      misaimed.push(`${mutant.rule}: ${fixture.id} does not exercise it`)
    }
  }

  t.alike(misaimed, [], 'every mutant is checked by a fixture that covers its rule')
})

test('every mutant states what the wrong reading produces', (t) => {
  const malformed = corpus.mutants().filter((mutant) => {
    if (mutant.hex !== undefined) return !HEX.test(mutant.hex)
    return mutant.decodes === undefined && mutant.rejects === undefined
  })

  t.alike(
    malformed.map((mutant) => mutant.rule),
    [],
    'a mutant carries well-formed bytes, a decoded value or a rejection'
  )
})

test('every mutant is killed by the fixture it names', (t) => {
  const survivors = []

  for (const mutant of corpus.mutants()) {
    const fixture = corpus.fixtureById(mutant.fixture)
    if (!fixture) continue

    const differs = OUTCOMES.some((key) => key in mutant && fixture[key] !== mutant[key])
    if (!differs) {
      survivors.push(`${mutant.rule}: ${fixture.id} does not reject "${mutant.reading}"`)
    }
  }

  t.alike(survivors, [], 'no mutant survives')
})
