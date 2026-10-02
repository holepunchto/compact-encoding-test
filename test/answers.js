const test = require('brittle')
const c = require('compact-encoding')
const corpus = require('../lib/corpus')
const { build, shaped } = require('../lib/declaration')
const { value } = require('../lib/notation')

const CEILINGS = new Set(['encode-ceiling', 'decode-ceiling', 'signed-range'])

function referenceRefuses(name, example) {
  const { category, codec } = corpus.loadCases(name)
  const declaration = codec || { name }
  const built = build(declaration, c)

  try {
    if (corpus.asks(example) === 'bytes') {
      c.encode(built, shaped(declaration, value(category, example.input.value)))
    } else {
      c.decode(built, Buffer.from(example.input.bytes, 'hex'))
    }
  } catch {
    return true
  }

  return false
}

test('a stated answer stands only where the reference refuses', (t) => {
  for (const name of corpus.codecs()) {
    for (const example of corpus.loadCases(name).cases) {
      if (example.answer === undefined) continue
      t.ok(referenceRefuses(name, example), `${example.id} states what the reference cannot`)
    }
  }
})

test('the ceiling rules commit no refusal', (t) => {
  for (const fixture of corpus.allFixtures()) {
    if (!fixture.rules.some((slug) => CEILINGS.has(slug))) continue

    const shape = corpus.kind(fixture.answer)
    t.ok(shape === 'hex' || shape === 'decodes', `${fixture.id} answers with the format's ${shape}`)
  }
})
