const fs = require('fs')
const { generate } = require('./lib/answers')

function write() {
  const { files, disagreements } = generate()

  if (disagreements.length > 0) {
    throw new Error(
      `the reference disagrees with the committed answers, which are the authority:\n` +
        disagreements.map((note) => `  ${note}`).join('\n')
    )
  }

  for (const [file, content] of Object.entries(files)) {
    fs.writeFileSync(file, content)
  }
}

module.exports = { generate, write }

if (require.main === module) write()
