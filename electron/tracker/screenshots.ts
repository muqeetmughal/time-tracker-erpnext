import screenshot from 'screenshot-desktop'
import path from 'path'
import fs from 'fs'

export async function captureScreenshot() {
  const dir = path.join(process.cwd(), 'screenshots')

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  const file = path.join(
    dir,
    `${Date.now()}.jpg`
  )

  await screenshot({
    filename: file,
  })

  return file
}