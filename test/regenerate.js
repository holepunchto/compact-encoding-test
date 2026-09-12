const test = require('brittle')
const { generate } = require('../generate')
const { readCommitted } = require('../lib/corpus')

test('regenerating the fixtures matches what is committed', (t) => {
  const generated = generate()
  const committed = readCommitted()

  for (const [file, content] of Object.entries(generated)) {
    t.is(committed[file], content, `${file} is byte-identical`)
  }

  t.alike(
    Object.keys(committed).sort(),
    Object.keys(generated).sort(),
    'no committed file is left behind by the generator'
  )
})
