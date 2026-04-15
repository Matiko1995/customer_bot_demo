import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { resolveProjectRootFromFileUrl } from './path-utils.mjs'

const rootDir = resolveProjectRootFromFileUrl(import.meta.url)
const distDir = resolve(rootDir, 'dist')
const version = process.env.CUSTOMER_BOT_WIDGET_VERSION || new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
const filePath = resolve(distDir, 'widget-version.json')

await mkdir(distDir, { recursive: true })
await writeFile(filePath, JSON.stringify({ version }, null, 2) + '\n', 'utf8')

console.log(`widget version written: ${version}`)
