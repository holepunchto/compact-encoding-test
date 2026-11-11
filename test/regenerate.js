const test = require('brittle')
const fs = require('fs')
const path = require('path')
const corpus = require('../lib/corpus')
const { fixturesDir } = require('..')
const { generate } = require('../lib/answers')

const ISSUE = /^https:\/\/github\.com\/holepunchto\/compact-encoding\/issues\/[0-9]+$/

test('the reference agrees with the answers, except the divergences declared', (t) => {
  t.alike(
    generate().disagreements,
    [],
    'the committed answers are the authority, and the reference is checked against them'
  )
})

test('every divergence names a case and the issue it waits on', (t) => {
  const ids = new Set(corpus.allFixtures().map((fixture) => fixture.id))
  const malformed = []

  for (const [id, divergence] of Object.entries(corpus.divergences())) {
    if (!ids.has(id)) {
      malformed.push(`${id}: names no case in the corpus`)
    } else if (!ISSUE.test(divergence.issue || '')) {
      malformed.push(`${id}: names no compact-encoding issue`)
    } else if (divergence.reference === undefined) {
      malformed.push(`${id}: does not say what the reference answers instead`)
    }
  }

  t.alike(malformed, [], 'a divergence says which case, which issue, and what the reference does')
})

test('the files beside the cases are the files the corpus generates', (t) => {
  for (const [file, content] of Object.entries(generate().files)) {
    t.is(
      fs.readFileSync(file, 'utf8'),
      content,
      `${path.relative(fixturesDir, file)} is byte-identical`
    )
  }
})
