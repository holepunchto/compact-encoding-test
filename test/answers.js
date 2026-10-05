const test = require('brittle')
const corpus = require('../lib/corpus')

const REFUSED_BY_THE_FORMAT = new Set(['unsigned-refuses-negative'])

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
