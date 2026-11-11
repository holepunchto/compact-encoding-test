const test = require('brittle')
const corpus = require('../lib/corpus')

const CARRIER = { value: 'case', decodes: 'decoded answer' }

function differences() {
  const admitted = corpus.carriedKinds()
  const carried = corpus.kinds()
  const out = []

  for (const [category, kinds] of Object.entries(carried)) {
    for (const side of Object.keys(CARRIER)) {
      const says = admitted[category] ? admitted[category][side] || [] : []

      for (const kind of kinds[side]) {
        if (!says.includes(kind)) {
          out.push(
            `${category}: a ${CARRIER[side]} carries ${kind}, which the taxonomy does not admit`
          )
        }
      }

      for (const kind of says) {
        if (!kinds[side].includes(kind)) {
          out.push(`${category}: the taxonomy admits ${kind}, which no ${CARRIER[side]} carries`)
        }
      }
    }
  }

  for (const category of Object.keys(admitted)) {
    if (carried[category] === undefined) {
      out.push(`${category}: the taxonomy names a category the corpus does not carry`)
    }
  }

  return out
}

test('the kinds the taxonomy carries are the kinds the cases carry', (t) => {
  t.alike(
    differences(),
    [],
    'a case carrying a kind the taxonomy does not admit fails until it is admitted'
  )
})

test('every category the taxonomy names carries a pair of lists', (t) => {
  const malformed = []

  for (const [category, carried] of Object.entries(corpus.carriedKinds())) {
    if (!Array.isArray(carried.value) || !Array.isArray(carried.decodes)) {
      malformed.push(`${category}: states no pair of lists`)
    }
  }

  t.alike(malformed, [], 'a category says what a case value and a decoded answer carry')
})
