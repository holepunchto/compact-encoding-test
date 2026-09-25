const test = require('brittle')
const { execFileSync } = require('child_process')
const corpus = require('./lib/corpus')

function packed() {
  const [tarball] = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' })
  )

  return tarball.files.map((file) => file.path)
}

function carried() {
  const out = ['CODECS.md']

  for (const name of corpus.codecs()) {
    out.push(`fixtures/${name}/cases.json`, `fixtures/${name}/answers.json`)
  }

  return out.concat(['fixtures/index.json', 'fixtures/delegated.json', 'fixtures/mutants.json'])
}

test('the package ships every file a consumer reads', (t) => {
  const files = new Set(packed())
  const missing = carried().filter((file) => !files.has(file))

  t.alike(missing, [], 'a file the corpus is read through is a file npm packs')
})
