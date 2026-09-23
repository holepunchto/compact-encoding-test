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

test('every decoded answer records how far the reading went', (t) => {
  const silent = corpus
    .allFixtures()
    .filter((fixture) => corpus.kind(fixture.answer) === 'decodes')
    .filter((fixture) => !Number.isInteger(fixture.answer.read))
    .map((fixture) => fixture.id)

  t.alike(silent, [], 'a decoded answer says how many bytes the decoder took')
})

test('a codec with no cases says why', (t) => {
  const silent = corpus
    .codecs()
    .filter((name) => corpus.loadCases(name).cases.length === 0)
    .filter((name) => !corpus.loadCases(name).reason)

  t.alike(silent, [], 'a codec the corpus does not cover states its reason')
})

const CARRIES = {
  strings: (value) => typeof value === 'string',
  floats: (value) => Number.isFinite(value) || corpus.tokenised(value)
}

function carries(category) {
  return CARRIES[category] || Number.isFinite
}

test('every case states one well-formed input', (t) => {
  const HEX = /^([0-9a-f][0-9a-f])*$/
  const malformed = []

  for (const name of corpus.codecs()) {
    const { category, cases } = corpus.loadCases(name)

    for (const example of cases) {
      const keys = Object.keys(example.input)

      if (keys.length !== 1) {
        malformed.push(`${example.id}: states ${keys.length} inputs`)
      } else if (example.input.value !== undefined && !carries(category)(example.input.value)) {
        malformed.push(`${example.id}: states a value the ${category} do not carry`)
      } else if (example.input.bytes !== undefined && !HEX.test(example.input.bytes)) {
        malformed.push(`${example.id}: states bytes that are not hex`)
      }
    }
  }

  t.alike(malformed, [], 'a case asks about a value its codec carries, or about bytes')
})
