import { describe, expect, it } from 'vitest'

import { resolveProjectRootFromFileUrl } from '../scripts/path-utils.mjs'

describe('write widget version path utils', () => {
  it('resolves a Windows file URL to the project root', () => {
    expect(
      resolveProjectRootFromFileUrl(
        'file:///D:/ai/aifactory_website/customer_bot_demo/scripts/write-widget-version.mjs',
        'win32'
      )
    ).toBe('D:\\ai\\aifactory_website\\customer_bot_demo')
  })

  it('resolves a POSIX file URL to the project root', () => {
    expect(
      resolveProjectRootFromFileUrl(
        'file:///home/user/customer_bot_demo/scripts/write-widget-version.mjs',
        'linux'
      )
    ).toBe('/home/user/customer_bot_demo')
  })
})
