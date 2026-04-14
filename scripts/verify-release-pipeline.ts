import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

type PackageJson = {
  scripts?: Record<string, string>
}

async function main() {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8')) as PackageJson
  const releaseScript = await readFile('scripts/release-current.sh', 'utf8')

  assert.equal(packageJson.scripts?.build?.includes('app:widget:build'), true)
  assert.equal(packageJson.scripts?.build?.includes('app:build'), true)
  assert.equal(packageJson.scripts?.['app:bundle'], 'npm run build && node scripts/archive-build-output.mjs')
  assert.equal(releaseScript.includes('[ ! -f "$ROOT_DIR/dist/customer-bot.js" ]'), true)
  assert.equal(releaseScript.includes('Missing widget artifact'), true)

  console.log('release pipeline verified')
}

void main()
