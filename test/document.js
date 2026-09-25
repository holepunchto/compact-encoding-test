const test = require('brittle')
const fs = require('fs')
const corpus = require('../lib/corpus')
const { specPath } = require('..')
const { ruleSlugs } = require('../lib/spec')

const SLUG_SHAPED = /`([a-z0-9][a-z0-9-]*-[a-z0-9-]+)`/g
const NOT_A_RULE = new Set(['compact-encoding', 'fixed-3'])

function document() {
  return fs.readFileSync(specPath, 'utf8')
}

function cited() {
  const out = new Set()

  for (const line of document().split('\n')) {
    for (const [, slug] of line.matchAll(SLUG_SHAPED)) {
      if (line.startsWith(`- \`${slug}\``) || NOT_A_RULE.has(slug)) continue
      out.add(slug)
    }
  }

  return out
}

function example() {
  const block = /```json\n([\s\S]*?)```/.exec(document())
  return block === null ? null : JSON.parse(block[1])
}

function answers() {
  const out = {}
  for (const fixture of corpus.allFixtures()) out[fixture.id] = fixture.answer
  return out
}

function shapes(of) {
  return new Set(Object.values(of).map((answer) => Object.keys(answer).sort().join('+')))
}

function carried() {
  const out = {}

  for (const name of corpus.codecs()) {
    const { category, cases } = corpus.loadCases(name)

    for (const example of cases) {
      const value = example.input.value
      if (value === undefined) continue

      const kind = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
      out[category] = [...new Set([...(out[category] || []), kind])].sort()
    }
  }

  return out
}

test('a slug the document cites names a rule it states', (t) => {
  const known = ruleSlugs()
  const dangling = [...cited()].filter((slug) => !known.has(slug))

  t.alike(dangling, [], 'a rule cited in prose is a rule the document defines')
})

test('the example answers are answers the corpus committed', (t) => {
  const committed = answers()
  const wrong = Object.entries(example()).filter(
    ([id, answer]) => JSON.stringify(committed[id]) !== JSON.stringify(answer)
  )

  t.alike(
    wrong.map(([id]) => id),
    [],
    'an answer shown in the document is the answer beside the case'
  )
})

test('the example shows every shape an answer takes', (t) => {
  const missing = [...shapes(answers())].filter((shape) => !shapes(example()).has(shape))

  t.alike(missing, [], 'a shape the corpus uses is a shape the document shows')
})

test('the values a category carries are the values the document describes', (t) => {
  t.alike(carried(), {
    'big-endian-integers': ['number'],
    booleans: ['boolean'],
    buffers: ['null', 'string'],
    combinators: ['array', 'number', 'object'],
    floats: ['number', 'string'],
    integers: ['number'],
    strings: ['string']
  })
})
