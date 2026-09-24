const test = require('brittle')
const c = require('compact-encoding')
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

function slug(declaration) {
  const parts = [declaration.name]

  for (const built of declaration.of || []) {
    parts.push(typeof built === 'number' ? String(built) : slug(built))
  }

  return parts.join('-')
}

test('a constructed codec is named after what it was built from', (t) => {
  const misnamed = []

  for (const name of corpus.codecs()) {
    const { codec } = corpus.loadCases(name)
    if (codec && slug(codec) !== name) misnamed.push(`${name}: built as ${slug(codec)}`)
  }

  t.alike(misnamed, [], 'a directory says what its codec was built from')
})

test('a codec with no cases says why', (t) => {
  const silent = corpus
    .codecs()
    .filter((name) => corpus.loadCases(name).cases.length === 0)
    .filter((name) => !corpus.loadCases(name).reason)

  t.alike(silent, [], 'a codec the corpus does not cover states its reason')
})

const BYTES = /^([0-9a-f][0-9a-f])*$/

const CARRIES = {
  strings: (value) => typeof value === 'string',
  floats: (value) => Number.isFinite(value) || corpus.tokenised(value),
  booleans: (value) => typeof value === 'boolean',
  buffers: (value) => value === null || (typeof value === 'string' && BYTES.test(value))
}

const BUILDS = {
  array: () => Array.isArray,
  record: () => (value) => value !== null && typeof value === 'object',
  fixed: () => CARRIES.buffers,
  frame: (declaration) => carrier(declaration.of[0])
}

function carrier(declaration) {
  const build = BUILDS[declaration.name]
  return build ? build(declaration) : carries(corpus.loadCases(declaration.name).category)
}

function carries(category, declaration) {
  return declaration ? carrier(declaration) : CARRIES[category] || Number.isFinite
}

test('the taxonomy accounts for every codec the reference exports', (t) => {
  const accounted = new Set()

  for (const name of corpus.codecs()) {
    const { codec } = corpus.loadCases(name)
    accounted.add(name)
    if (codec) accounted.add(slug(codec).replace(/-/g, ''))
  }

  const absent = Object.keys(c)
    .filter((name) => typeof c[name]?.preencode === 'function')
    .filter((name) => !accounted.has(name))

  t.alike(absent, [], 'a codec the reference exports is covered or recorded with a reason')
})

test('every codec the reference exports is a codec or a helper the corpus knows', (t) => {
  const helpers = new Set([
    'state',
    'from',
    'encode',
    'decode',
    'array',
    'fixed',
    'frame',
    'record'
  ])
  const unknown = Object.keys(c)
    .filter((name) => typeof c[name] === 'function')
    .filter((name) => !helpers.has(name))

  t.alike(unknown, [], 'a helper the reference grows is named here rather than passing unseen')
})

test('a codec with no cases says which implementations carry it', (t) => {
  const silent = corpus
    .codecs()
    .filter((name) => corpus.loadCases(name).cases.length === 0)
    .filter((name) => !Array.isArray(corpus.loadCases(name).implementations))

  t.alike(silent, [], 'a codec the corpus does not cover names the implementations that have it')
})

test('every case states one well-formed input', (t) => {
  const HEX = /^([0-9a-f][0-9a-f])*$/
  const malformed = []

  for (const name of corpus.codecs()) {
    const { category, cases, codec: declaration } = corpus.loadCases(name)

    for (const example of cases) {
      const keys = Object.keys(example.input)

      if (keys.length !== 1) {
        malformed.push(`${example.id}: states ${keys.length} inputs`)
      } else if (
        example.input.value !== undefined &&
        !carries(category, declaration)(example.input.value)
      ) {
        malformed.push(`${example.id}: states a value the ${category} do not carry`)
      } else if (example.input.bytes !== undefined && !HEX.test(example.input.bytes)) {
        malformed.push(`${example.id}: states bytes that are not hex`)
      }
    }
  }

  t.alike(malformed, [], 'a case asks about a value its codec carries, or about bytes')
})
