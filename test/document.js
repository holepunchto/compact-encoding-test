const test = require('brittle')
const fs = require('fs')
const c = require('compact-encoding')
const corpus = require('../lib/corpus')
const { fixturesDir, specPath } = require('..')
const { ruleSlugs } = require('../lib/spec')
const { render } = require('../claims')
const conformance = require('../conformance')
const contractPath = require('path').join(__dirname, '..', 'CONFORMANCE.md')
const claimsPath = require('path').join(__dirname, '..', 'CLAIMS.md')
const { RECORDS } = require('../lib/declaration')
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

const ESCAPE = /\\u([0-9a-fA-F]{4})/g

function lone(text) {
  const units = [...text.matchAll(ESCAPE)].map((m) => ({ code: parseInt(m[1], 16), at: m.index }))
  const out = []

  for (let i = 0; i < units.length; i++) {
    const { code, at } = units[i]
    if (code < 0xd800 || code > 0xdfff) continue

    const next = units[i + 1]
    if (
      code <= 0xdbff &&
      next &&
      next.at === at + 6 &&
      next.code >= 0xdc00 &&
      next.code <= 0xdfff
    ) {
      i++
      continue
    }

    out.push(code.toString(16))
  }

  return out
}

test('no fixture carries a surrogate with nothing to pair with', (t) => {
  const stranded = []

  for (const name of corpus.codecs()) {
    for (const file of ['cases.json', 'answers.json']) {
      const path = `${fixturesDir}/${name}/${file}`
      if (!fs.existsSync(path)) continue
      for (const code of lone(fs.readFileSync(path, 'utf8'))) {
        stranded.push(`${name}/${file}: \\u${code}`)
      }
    }
  }

  t.alike(stranded, [], 'a strict JSON parser reads every fixture the corpus ships')
})

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
    if (!codec || !RECORDS.has(codec.name)) continue

    for (const example of cases) {
      const pairs = example.input.value
      if (pairs === undefined) continue

      const keys = pairs.map(([key]) => key)
      if (Object.keys(Object.fromEntries(pairs)).join() !== keys.join()) reordered.push(example.id)
    }
  }

  t.alike(reordered, [], 'a record case states an order the reference can write')
})

test('every code unit outside ASCII is written as an escape', (t) => {
  const raw = fs
    .readdirSync(fixturesDir, { recursive: true })
    .filter((file) => file.endsWith('.json'))
    .filter((file) => /[\u0080-\uffff]/.test(fs.readFileSync(`${fixturesDir}/${file}`, 'utf8')))

  t.alike(raw.sort(), [], 'a fixture file is ASCII throughout, as the preamble says')
})

const HEX_KEYS = ['hex', 'bytes', 'bits']

function hexIn(answer) {
  if (answer === null || typeof answer !== 'object') return []
  return HEX_KEYS.filter((key) => typeof answer[key] === 'string').map((key) => answer[key])
}

test('every hex value in a fixture is lowercase', (t) => {
  const kinds = corpus.kinds()
  const wrong = []

  for (const name of corpus.codecs()) {
    const { category, cases } = corpus.loadCases(name)
    const answers = corpus.loadAnswers(name)
    const bytes = kinds[category].value.includes('bytes')

    for (const example of cases) {
      const answer = answers[example.id] ?? example.answer
      const found = [
        ...hexIn(example.input),
        ...hexIn(answer),
        ...(example.alternatives ?? []).flatMap(hexIn)
      ]

      if (bytes) {
        if (typeof example.input.value === 'string') found.push(example.input.value)
        if (typeof answer?.decodes === 'string') found.push(answer.decodes)
      }

      for (const hex of found) {
        if (hex !== hex.toLowerCase()) wrong.push(`${example.id}: ${hex}`)
      }
    }
  }

  for (const mutant of corpus.mutants()) {
    for (const hex of hexIn(mutant.answer)) {
      if (hex !== hex.toLowerCase()) wrong.push(`${mutant.fixture}: ${hex}`)
    }
  }

  t.alike(wrong.sort(), [], 'a fixture writes its hex in lowercase, as the preamble says')
})

test('the contract reports the numbers a run produces', (t) => {
  const contract = fs.readFileSync(contractPath, 'utf8')
  const stated = /matches (\d+) of the (\d+) cases and diverges on (\d+)/.exec(contract)

  t.ok(stated, 'the contract says what a first run reports')

  const report = conformance.run()
  const matched = report.reduce((n, r) => n + r.matched, 0)
  const diverged = report.reduce((n, r) => n + r.diverged.length, 0)

  t.alike(
    stated.slice(1).map(Number),
    [matched, matched + diverged, diverged],
    'a port reading the contract meets the run it describes'
  )
})

test('the claims are the claims the document makes', (t) => {
  t.is(
    render(),
    fs.readFileSync(claimsPath, 'utf8'),
    'CLAIMS.md is what claims.js writes from CODECS.md'
  )
})

const VALUE_ROW = /^\|\s*(-?[\w.]+)\s*\|\s*`([0-9a-f]+)`\s*\|\s*`([0-9a-f]+)`\s*\|$/gm

const TOKENS = new Map([
  ['NaN', NaN],
  ['Infinity', Infinity],
  ['-Infinity', -Infinity],
  ['-0', -0]
])

function written(codec, value) {
  const state = c.state()
  codec.preencode(state, value)
  state.buffer = Buffer.alloc(state.end)
  codec.encode(state, value)
  return state.buffer.toString('hex')
}

test('every value the document tabulates writes what it says', (t) => {
  const rows = [...document().matchAll(VALUE_ROW)]
  const wrong = []

  t.ok(rows.length > 0, 'the table is found')

  for (const [, spelling, at32, at64] of rows) {
    const value = TOKENS.has(spelling) ? TOKENS.get(spelling) : Number(spelling)

    for (const [codec, expected, width] of [
      [c.float32, at32, 'float32'],
      [c.float64, at64, 'float64']
    ]) {
      const bytes = written(codec, value)
      if (bytes !== expected) {
        wrong.push(`${spelling} through ${width}: says ${expected}, writes ${bytes}`)
      }
    }
  }

  t.alike(wrong, [], 'a worked example in the document is one the reference produces')
})

test('the inventory names every codec and no other', (t) => {
  const listed = [
    ...document().matchAll(/^\|\s*`([^`]+)`\s*\|\s*([a-z-]+)\s*\|\s*(yes|no)\s*\|$/gm)
  ].map(([, codec, family, covered]) => `${codec} ${family} ${covered}`)

  const carried = []
  for (const [family, codecs] of Object.entries(corpus.capabilities())) {
    for (const [codec, cases] of Object.entries(codecs)) {
      carried.push(`${codec} ${family} ${cases.length > 0 ? 'yes' : 'no'}`)
    }
  }

  t.alike(
    listed.sort(),
    carried.sort(),
    'the inventory is the corpus, not a copy of it that drifted'
  )
})

test('every escape in a fixture is lowercase', (t) => {
  const wrong = fs
    .readdirSync(fixturesDir, { recursive: true })
    .filter((file) => file.endsWith('.json'))
    .filter((file) =>
      [...fs.readFileSync(`${fixturesDir}/${file}`, 'utf8').matchAll(ESCAPE)].some(
        (m) => m[1] !== m[1].toLowerCase()
      )
    )

  t.alike(wrong.sort(), [], 'an escape spells its digits in lowercase, as the preamble says')
})
