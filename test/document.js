const test = require('brittle')
const fs = require('fs')
const corpus = require('../lib/corpus')
const { fixturesDir, specPath } = require('..')
const { ruleSlugs } = require('../lib/spec')
const { devDependencies } = require('../package.json')

const SLUG_SHAPED = /`([a-z0-9][a-z0-9-]*-[a-z0-9-]+)`/g

function document() {
  return fs.readFileSync(specPath, 'utf8')
}

function named() {
  return new Set([...corpus.codecs(), ...Object.keys(devDependencies)])
}

function cited() {
  const out = new Set()
  const otherwise = named()

  for (const line of document().split('\n')) {
    for (const [, slug] of line.matchAll(SLUG_SHAPED)) {
      if (line.startsWith(`- \`${slug}\``) || otherwise.has(slug)) continue
      out.add(slug)
    }
  }

  return out
}

function shown() {
  return JSON.parse(/```json\n([\s\S]*?)```/.exec(document())[1])
}

function committed() {
  const out = {}
  for (const fixture of corpus.allFixtures()) out[fixture.id] = fixture.answer
  return out
}

function shapes(answers) {
  return new Set(Object.values(answers).map((answer) => Object.keys(answer).sort().join('+')))
}

test('a slug the document cites names a rule it states', (t) => {
  const known = ruleSlugs()
  const dangling = [...cited()].filter((slug) => !known.has(slug))

  t.alike(dangling, [], 'a rule cited in prose is a rule the document defines')
})

test('the example answers are answers the corpus committed', (t) => {
  const answers = committed()
  const wrong = Object.entries(shown())
    .filter(([id, answer]) => JSON.stringify(answers[id]) !== JSON.stringify(answer))
    .map(([id]) => id)

  t.alike(wrong, [], 'an answer shown in the document is the answer beside the case')
})

test('the example shows every shape an answer takes', (t) => {
  const seen = shapes(shown())
  const missing = [...shapes(committed())].filter((shape) => !seen.has(shape))

  t.alike(missing, [], 'a shape the corpus uses is a shape the document shows')
})

function numbers(text) {
  return text.replace(/"(\\.|[^"\\])*"/g, '""').match(/-?\d[\d.]*(?:e[+-]?\d+)?/gi) || []
}

test('a number in an answer is spelled the way JSON spells it', (t) => {
  const odd = []

  for (const name of corpus.codecs()) {
    for (const file of ['answers.json']) {
      const path = `${fixturesDir}/${name}/${file}`
      if (!fs.existsSync(path)) continue

      for (const spelling of numbers(fs.readFileSync(path, 'utf8'))) {
        if (spelling !== String(Number(spelling))) odd.push(`${name}/${file}: ${spelling}`)
      }
    }
  }

  t.alike(odd, [], 'a number in an answer is written as JSON writes it')
})

test('a record case carries pairs the reference keeps in order', (t) => {
  const reordered = []

  for (const name of corpus.codecs()) {
    const { codec, cases } = corpus.loadCases(name)
    if (!codec || codec.name !== 'record') continue

    for (const example of cases) {
      const pairs = example.input.value
      if (pairs === undefined) continue

      const keys = pairs.map(([key]) => key)
      if (Object.keys(Object.fromEntries(pairs)).join() !== keys.join()) reordered.push(example.id)
    }
  }

  t.alike(reordered, [], 'a record case states an order the reference can write')
})
