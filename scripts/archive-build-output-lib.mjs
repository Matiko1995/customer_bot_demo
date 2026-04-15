import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import process from 'node:process'

const ARCHIVE_INCLUDES = ['.output', '.data', 'dist']
const EXCLUDED_DATA_FILES = ['runtime-port.json', '*.bak-*']

export function assertExists(path, message) {
  if (!existsSync(path)) {
    throw new Error(message)
  }
}

export function shouldCopyDataPath(sourcePath) {
  const name = basename(sourcePath)
  if (name === 'runtime-port.json') {
    return false
  }
  if (name.includes('.bak-')) {
    return false
  }
  return true
}

export function getArchivePaths(projectRoot = process.cwd()) {
  return {
    projectRoot,
    outputDir: resolve(projectRoot, '.output'),
    dataDir: resolve(projectRoot, '.data'),
    distDir: resolve(projectRoot, 'dist'),
    archivePath: resolve(projectRoot, 'build-output.tar.gz')
  }
}

export function prepareArchiveStaging({ projectRoot = process.cwd(), stagingDir }) {
  const { outputDir, dataDir, distDir, archivePath } = getArchivePaths(projectRoot)

  assertExists(outputDir, `未找到构建产物: ${outputDir}`)
  assertExists(resolve(outputDir, 'server', 'index.mjs'), '未找到 .output/server/index.mjs')
  assertExists(resolve(distDir, 'customer-bot.js'), '未找到 dist/customer-bot.js')

  cpSync(outputDir, resolve(stagingDir, '.output'), { recursive: true })
  cpSync(distDir, resolve(stagingDir, 'dist'), { recursive: true })

  const stagedDataDir = resolve(stagingDir, '.data')
  if (existsSync(dataDir)) {
    cpSync(dataDir, stagedDataDir, {
      recursive: true,
      filter: shouldCopyDataPath
    })
  } else {
    mkdirSync(stagedDataDir, { recursive: true })
  }

  return {
    archivePath,
    includes: ARCHIVE_INCLUDES,
    excludedDataFiles: EXCLUDED_DATA_FILES
  }
}

export function runTar({ stagingDir, archivePath }) {
  const result = spawnSync('tar', ['-czf', archivePath, ...ARCHIVE_INCLUDES], {
    cwd: stagingDir,
    env: {
      ...process.env,
      COPYFILE_DISABLE: '1'
    },
    stdio: 'pipe',
    encoding: 'utf8'
  })

  if (result.status !== 0) {
    const details = [result.stderr, result.stdout].filter(Boolean).join('\n').trim()
    throw new Error(details || '构建产物压缩失败')
  }
}

export function createBuildArchive(projectRoot = process.cwd()) {
  const { archivePath } = getArchivePaths(projectRoot)

  rmSync(archivePath, { force: true })
  const stagingDir = mkdtempSync(join(tmpdir(), 'aim-build-archive-'))

  try {
    const metadata = prepareArchiveStaging({ projectRoot, stagingDir })
    runTar({ stagingDir, archivePath: metadata.archivePath })
    return metadata
  } finally {
    rmSync(stagingDir, { recursive: true, force: true })
  }
}
