const test = require('brittle')
const corpus = require('..')
const { rules, malformed } = require('../lib/spec')

test('the specification states at least one rule', (t) => {
  t.ok(rules().length > 0, 'CODECS.md carries rules')
})

test('every rule-shaped line parses as a rule', (t) => {
  t.alike(malformed(), [], 'a rule the parser cannot read would be silently uncovered')
})

test('every rule is cited by a fixture', (t) => {
  const cited = new Set()
  for (const fixture of corpus.allFixtures()) {
    for (const slug of fixture.rules) cited.add(slug)
  }

  const uncovered = rules()
    .map((rule) => rule.slug)
    .filter((slug) => !cited.has(slug))

  t.alike(uncovered, [], 'no rule ships without a fixture')
})

test('every citation names a rule that exists', (t) => {
  const known = new Set(rules().map((rule) => rule.slug))
  const dangling = []

  for (const fixture of corpus.allFixtures()) {
    for (const slug of fixture.rules) {
      if (!known.has(slug)) dangling.push(`${fixture.id} -> ${slug}`)
    }
  }

  t.alike(dangling, [], 'no fixture cites a rule the specification does not state')
})
