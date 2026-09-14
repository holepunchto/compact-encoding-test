const test = require('brittle')
const corpus = require('../lib/corpus')
const { rules } = require('../lib/spec')

test('the delegated markers agree', (t) => {
  const inSpec = rules()
    .filter((rule) => rule.delegated)
    .map((rule) => rule.slug)
    .sort()

  t.alike(
    corpus.delegated().slice().sort(),
    inSpec,
    'the taxonomy and the specification mark the same rules delegated'
  )
})
