const test = require('brittle')
const corpus = require('../lib/corpus')

const REFUSED_BY_THE_FORMAT = new Set([
  'integer-refuses-a-fraction',
  'unsigned-refuses-negative',
  'fixed-width-refuses-overflow'
])

test('a rule a number type may not hold commits the format answer', (t) => {
  const marked = new Set(
    corpus.unrepresentable().filter((slug) => !REFUSED_BY_THE_FORMAT.has(slug))
  )

  for (const fixture of corpus.allFixtures()) {
    if (!fixture.rules.some((slug) => marked.has(slug))) continue

    const shape = corpus.kind(fixture.answer)
    t.ok(shape === 'hex' || shape === 'decodes', `${fixture.id} answers with the format's ${shape}`)
  }
})

test('an answer no implementation generates kills a mutant', (t) => {
  const aimed = new Set(corpus.mutants().map((mutant) => mutant.fixture))
  const declared = corpus.divergences()
  const unchecked = []

  for (const name of corpus.codecs()) {
    for (const example of corpus.loadCases(name).cases) {
      const generated = example.answer === undefined && declared[example.id] === undefined
      if (!generated && !aimed.has(example.id)) unchecked.push(example.id)
    }
  }

  t.alike(unchecked, [], 'an answer the reference does not give is contradicted by a wrong reading')
})
