const test = require('brittle')
const corpus = require('..')
const { ruleSlugs } = require('../lib/spec')

const HEX = /^([0-9a-f][0-9a-f])*$/

// A case that carries a value asks what it encodes to; a case that carries
// bytes asks what a decoder makes of them. Rejecting and decoding are two
// answers to the second question, so a mutant contradicts within one question.
function question(fixture) {
  return fixture.input.value !== undefined ? 'bytes' : 'meaning'
}

function answers(answer) {
  return answer.hex !== undefined ? 'bytes' : 'meaning'
}

function stated(answer) {
  if (answer.hex !== undefined) return `bytes ${answer.hex}`
  if (answer.rejects) return 'rejected'
  return `decodes ${answer.decodes}`
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

test('every mutant answers the question its fixture asks', (t) => {
  const mismatched = []

  for (const mutant of corpus.mutants()) {
    const fixture = corpus.fixtureById(mutant.fixture)
    if (!fixture) continue

    if (answers(mutant.answer) !== question(fixture)) {
      mismatched.push(
        `${mutant.rule}: answers in ${answers(mutant.answer)} a case asking about ${question(fixture)}`
      )
    } else if (mutant.answer.hex !== undefined && !HEX.test(mutant.answer.hex)) {
      mismatched.push(`${mutant.rule}: states bytes that are not hex`)
    }
  }

  t.alike(mismatched, [], 'a mutant contradicts its fixture in the terms the case asks about')
})

test('every mutant is killed by the fixture it names', (t) => {
  const survivors = []

  for (const mutant of corpus.mutants()) {
    const fixture = corpus.fixtureById(mutant.fixture)
    if (!fixture) continue

    if (stated(mutant.answer) === stated(fixture.answer)) {
      survivors.push(`${mutant.rule}: ${fixture.id} does not reject "${mutant.reading}"`)
    }
  }

  t.alike(survivors, [], 'no mutant survives')
})
