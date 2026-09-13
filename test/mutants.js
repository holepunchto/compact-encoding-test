const test = require('brittle')
const corpus = require('..')
const { ruleSlugs } = require('../lib/spec')

const HEX = /^([0-9a-f][0-9a-f])*$/

// A round-trip case asks what a value encodes to; a decode-only case asks what
// a decoder makes of some bytes. Rejecting and decoding are two answers to the
// second question, so a mutant contradicts a fixture only within one question.
function outcome(entry) {
  if (entry.rejects !== undefined) return { kind: 'meaning', answer: 'rejected' }
  if (entry.decodes !== undefined) return { kind: 'meaning', answer: `decodes ${entry.decodes}` }
  if (entry.hex !== undefined) return { kind: 'bytes', answer: entry.hex }
  return { kind: 'none', answer: undefined }
}

test('mutants exist', (t) => {
  t.ok(corpus.mutants().length > 0, 'the corpus carries mutants')
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

test('every mutant answers its fixture in the same terms', (t) => {
  const mismatched = []

  for (const mutant of corpus.mutants()) {
    const fixture = corpus.fixtureById(mutant.fixture)
    if (!fixture) continue

    const wrong = outcome(mutant)
    const right = outcome(fixture)

    if (wrong.kind !== right.kind) {
      mismatched.push(
        `${mutant.rule}: answers in ${wrong.kind} a fixture answered in ${right.kind}`
      )
    } else if (wrong.kind === 'bytes' && !HEX.test(wrong.answer)) {
      mismatched.push(`${mutant.rule}: states bytes that are not hex`)
    }
  }

  t.alike(mismatched, [], 'a mutant contradicts its fixture in the terms that fixture answers')
})

test('every mutant is killed by the fixture it names', (t) => {
  const survivors = []

  for (const mutant of corpus.mutants()) {
    const fixture = corpus.fixtureById(mutant.fixture)
    if (!fixture) continue

    const wrong = outcome(mutant)
    const right = outcome(fixture)

    if (wrong.kind === right.kind && wrong.answer === right.answer) {
      survivors.push(`${mutant.rule}: ${fixture.id} does not reject "${mutant.reading}"`)
    }
  }

  t.alike(survivors, [], 'no mutant survives')
})
