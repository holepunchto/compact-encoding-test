const test = require('brittle')
const { execFileSync } = require('child_process')

function packed() {
  const [tarball] = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' })
  )

  return tarball.files.map((file) => file.path)
}

test('the package ships the specification and the fixtures', (t) => {
  const files = packed()

  t.ok(files.includes('CODECS.md'), 'CODECS.md is packed')
  t.ok(
    files.some((file) => file.startsWith('fixtures/')),
    'the fixtures are packed'
  )
})
