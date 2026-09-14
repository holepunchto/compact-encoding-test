const test = require('brittle')
const corpus = require('..')
const { rules, ruleSlugs } = require('../lib/spec')

const HEX = /^([0-9a-f][0-9a-f])*$/

function fixtures() {
  return new Map(corpus.allFixtures().map((fixture) => [fixture.id, fixture]))
}

function stated(answer) {
  if (answer.hex !== undefined) return `bytes ${answer.hex}`
  if (answer.rejects !== undefined) return 'rejected'
  return `decodes ${answer.decodes}`
}

test('mutants exist', (t) => {
  t.ok(corpus.mutants().length > 0, 'the corpus carries mutants')
})

test('every mutant states one well-formed answer', (t) => {
  const malformed = []

  for (const mutant of corpus.mutants()) {
    const keys = Object.keys(mutant.answer)

    if (keys.length !== 1) {
      malformed.push(`${mutant.rule}: states ${keys.length} answers`)
    } else if (mutant.answer.hex !== undefined && !HEX.test(mutant.answer.hex)) {
      malformed.push(`${mutant.rule}: states bytes that are not hex`)
    } else if (mutant.answer.rejects !== undefined && mutant.answer.rejects !== true) {
      malformed.push(`${mutant.rule}: states a rejection that is not one`)
    }
  }

  t.alike(malformed, [], 'a mutant asserts exactly one outcome, and asserts something')
})

test('every mutant names a rule the specification states', (t) => {
  const known = ruleSlugs()
  const unknown = corpus.mutants().filter((mutant) => !known.has(mutant.rule))

  t.alike(
    unknown.map((mutant) => mutant.rule),
    [],
    'no mutant names a rule that does not exist'
  )
})

test('every rule is mutated', (t) => {
  const mutated = new Set(corpus.mutants().map((mutant) => mutant.rule))
  const unmutated = rules()
    .map((rule) => rule.slug)
    .filter((slug) => !mutated.has(slug))

  t.alike(unmutated, [], 'no rule ships without a wrong reading for its fixtures to reject')
})

test('every mutant is aimed at a fixture that exercises its rule', (t) => {
  const byId = fixtures()
  const misaimed = []

  for (const mutant of corpus.mutants()) {
    const fixture = byId.get(mutant.fixture)

    if (!fixture) {
      misaimed.push(`${mutant.rule}: names an unknown fixture ${mutant.fixture}`)
    } else if (!fixture.rules.includes(mutant.rule)) {
      misaimed.push(`${mutant.rule}: ${fixture.id} does not exercise it`)
    }
  }

  t.alike(misaimed, [], 'every mutant is checked by a fixture that covers its rule')
})

test('every mutant answers the question its fixture asks', (t) => {
  const byId = fixtures()
  const mismatched = []

  for (const mutant of corpus.mutants()) {
    const fixture = byId.get(mutant.fixture)
    const asked = corpus.asks(fixture)
    const answered = corpus.states(mutant.answer)

    if (answered !== asked) {
      mismatched.push(`${mutant.rule}: answers in ${answered} a case asking about ${asked}`)
    }
  }

  t.alike(mismatched, [], 'a mutant contradicts its fixture in the terms the case asks about')
})

test('every mutant is killed by the fixture it names', (t) => {
  const byId = fixtures()
  const survivors = []

  for (const mutant of corpus.mutants()) {
    const fixture = byId.get(mutant.fixture)

    if (stated(mutant.answer) === stated(fixture.answer)) {
      survivors.push(`${mutant.rule}: ${fixture.id} does not reject "${mutant.reading}"`)
    }
  }

  t.alike(survivors, [], 'no mutant survives')
})
