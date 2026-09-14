const test = require('brittle')
const corpus = require('../lib/corpus')
const { rules, ruleSlugs, malformed } = require('../lib/spec')

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
  const known = ruleSlugs()
  const dangling = []

  for (const fixture of corpus.allFixtures()) {
    for (const slug of fixture.rules) {
      if (!known.has(slug)) dangling.push(`${fixture.id} -> ${slug}`)
    }
  }

  t.alike(dangling, [], 'no fixture cites a rule the specification does not state')
})

test('every case cites a rule', (t) => {
  const uncited = corpus
    .allFixtures()
    .filter((fixture) => fixture.rules.length === 0)
    .map((fixture) => fixture.id)

  t.alike(uncited, [], 'no case sits in the corpus without saying what it checks')
})

test('case ids are unique across the corpus', (t) => {
  const seen = new Set()
  const repeated = []

  for (const fixture of corpus.allFixtures()) {
    if (seen.has(fixture.id)) repeated.push(fixture.id)
    seen.add(fixture.id)
  }

  t.alike(repeated, [], 'no id is claimed twice')
})
