const fs = require('fs')
const path = require('path')
const { fixturesDir } = require('..')
const notation = require('./notation')

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function codecs() {
  return fs
    .readdirSync(fixturesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function capabilities() {
  return readJSON(path.join(fixturesDir, 'index.json'))
}

function delegated() {
  return readJSON(path.join(fixturesDir, 'delegated.json'))
}

function unrepresentable() {
  return readJSON(path.join(fixturesDir, 'unrepresentable.json'))
}

function divergences() {
  return readJSON(path.join(fixturesDir, 'divergences.json'))
}

function mutants() {
  return readJSON(path.join(fixturesDir, 'mutants.json'))
}

function loadCases(name) {
  return readJSON(path.join(fixturesDir, name, 'cases.json'))
}

function loadAnswers(name) {
  return readJSON(path.join(fixturesDir, name, 'answers.json'))
}

function fixtures(name) {
  const { cases } = loadCases(name)
  const answers = loadAnswers(name)
  return cases.map((example) => ({ ...example, answer: answers[example.id] }))
}

function allFixtures() {
  return codecs().flatMap(fixtures)
}

function kinds() {
  const out = {}

  for (const name of codecs()) {
    const { category, cases } = loadCases(name)
    const answers = loadAnswers(name)
    const carried = out[category] || { value: new Set(), decodes: new Set() }

    for (const example of cases) {
      if (example.input.value !== undefined) {
        carried.value.add(notation.kindOf(category, example.input.value))
      }

      const answer = answers[example.id]
      if (answer !== undefined && answer.decodes !== undefined) {
        carried.decodes.add(notation.kindOf(category, answer.decodes))
      }
    }

    out[category] = carried
  }

  return Object.fromEntries(
    Object.entries(out).map(([category, carried]) => [
      category,
      { value: [...carried.value].sort(), decodes: [...carried.decodes].sort() }
    ])
  )
}

function carriedKinds() {
  return readJSON(path.join(fixturesDir, 'kinds.json'))
}

function asks(example) {
  return example.input.value !== undefined ? 'bytes' : 'meaning'
}

function kind(answer) {
  if (answer.hex !== undefined) return 'hex'
  if (answer.refused !== undefined) return 'refused'
  if (answer.decodes !== undefined) return 'decodes'
  return 'rejects'
}

function states(answer) {
  const shape = kind(answer)
  return shape === 'hex' || shape === 'refused' ? 'bytes' : 'meaning'
}

module.exports = {
  allFixtures,
  asks,
  capabilities,
  carriedKinds,
  codecs,
  delegated,
  divergences,
  fixtures,
  fixturesDir,
  kind,
  kinds,
  loadAnswers,
  loadCases,
  mutants,
  states,
  unrepresentable
}
