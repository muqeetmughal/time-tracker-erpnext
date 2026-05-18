import screenshot from 'screenshot-desktop'
import path from 'path'
import fs from 'fs'
import { getConfig } from '../store'
import { reviewImageBeforeUpload } from './image-review'
import type { AppConfig } from '../types'

export type CapturedImage = {
  timestamp: string
  filePath: string
  approved: boolean
  rejected: boolean
}

function ensureScreenshotDir() {
  const dir = path.join(process.cwd(), 'screenshots')

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  return dir
}

async function reviewCapturedFile(filePath: string, config: AppConfig) {
  const approved = await reviewImageBeforeUpload(filePath, config)

  return {
    timestamp: new Date().toISOString(),
    filePath,
    approved,
    rejected: !approved,
  }
}

export async function captureScreenshotsDetailed(config = getConfig()) {
  if (!config.general.takeScreenshots) {
    return []
  }

  const dir = ensureScreenshotDir()
  const timestamp = Date.now()

  if (config.trackingSources.screenshotsFrom === 'all') {
    const displays = await screenshot.listDisplays()
    const files = await Promise.all(
      displays.map(async (display, index) => {
        const file = path.join(
          dir,
          `${timestamp}-${index}.jpg`
        )

        await screenshot({
          filename: file,
          screen: display.id,
        })

        return file
      })
    )

    return Promise.all(files.map((file) => reviewCapturedFile(file, config)))
  }

  const file = path.join(
    dir,
    `${timestamp}.jpg`
  )

  await screenshot({
    filename: file,
  })

  return [await reviewCapturedFile(file, config)]
}

export async function captureScreenshot() {
  const captures = await captureScreenshotsDetailed()

  return captures
    .filter((capture) => capture.approved)
    .map((capture) => capture.filePath)
}
