import { existsSync } from 'node:fs'
import { mkdtemp, mkdir, readdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { prepareArchiveStaging } from '../scripts/archive-build-output-lib.mjs'

describe('archive build output', () => {
  it('creates an empty staged data directory when project data is missing', async () => {
    const projectRoot = await mkdtemp(join(tmpdir(), 'customer-bot-archive-project-'))
    const stagingDir = await mkdtemp(join(tmpdir(), 'customer-bot-archive-staging-'))

    await mkdir(resolve(projectRoot, '.output', 'server'), { recursive: true })
    await mkdir(resolve(projectRoot, 'dist'), { recursive: true })
    await writeFile(resolve(projectRoot, '.output', 'server', 'index.mjs'), 'export default {};\n', 'utf8')
    await writeFile(resolve(projectRoot, 'dist', 'customer-bot.js'), 'console.log("bot");\n', 'utf8')

    prepareArchiveStaging({ projectRoot, stagingDir })

    const stagedDataDir = resolve(stagingDir, '.data')
    expect(existsSync(stagedDataDir)).toBe(true)
    await expect(readdir(stagedDataDir)).resolves.toEqual([])
  })
})
