function slug(declaration) {
  const parts = [declaration.name]

  for (const built of declaration.of || []) {
    parts.push(typeof built === 'number' ? String(built) : slug(built))
  }

  return parts.join('-')
}

function build(declaration, codecs) {
  if (typeof declaration === 'number') return declaration

  const built = (declaration.of || []).map((of) => build(of, codecs))
  const named = codecs[declaration.name]

  return built.length === 0 ? named : named(...built)
}

function carries(declaration, carriers) {
  const CARRIED = {
    array: () => Array.isArray,
    record: () => (value) => value !== null && typeof value === 'object',
    fixed: () => carriers.of('buffers'),
    frame: (of) => carries(of.of[0], carriers)
  }

  const carried = CARRIED[declaration.name]
  return carried ? carried(declaration) : carriers.of(carriers.category(declaration.name))
}

module.exports = { build, carries, slug }
