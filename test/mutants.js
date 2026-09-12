const test = require('brittle')
const { mutants, fixtureById } = require('../lib/corpus')

test('mutants exist', (t) => {
  t.ok(mutants().length > 0, 'the corpus carries mutants')
})

test('every mutant is killed by the fixture it names', (t) => {
  const survivors = []

  for (const mutant of mutants()) {
    const fixture = fixtureById(mutant.fixture)
    if (!fixture) {
      survivors.push(`${mutant.rule}: names an unknown fixture ${mutant.fixture}`)
      continue
    }
    if (fixture.hex === mutant.hex) {
      survivors.push(`${mutant.rule}: ${fixture.id} does not reject "${mutant.reading}"`)
    }
  }

  t.alike(survivors, [], 'no mutant survives')
})
