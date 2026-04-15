import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function resolveProjectRootFromFileUrl(fileUrl, platform = process.platform) {
  const windows = platform === 'win32'
  const pathApi = windows ? path.win32 : path.posix
  const filePath = fileURLToPath(fileUrl, { windows })

  return pathApi.resolve(pathApi.dirname(filePath), '..')
}
