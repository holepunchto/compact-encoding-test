const test = require('brittle')
const { rules } = require('../lib/spec')
const { delegated } = require('..')

test('the delegated markers agree', (t) => {
  const inSpec = rules()
    .filter((rule) => rule.delegated)
    .map((rule) => rule.slug)
    .sort()

  t.alike(
    [...delegated].sort(),
    inSpec,
    'the taxonomy and the specification mark the same rules delegated'
  )
})

test('a delegated rule is a rule', (t) => {
  const known = new Set(rules().map((rule) => rule.slug))
  const unknown = delegated.filter((slug) => !known.has(slug))

  t.alike(unknown, [], 'the taxonomy marks only rules the specification states')
})
