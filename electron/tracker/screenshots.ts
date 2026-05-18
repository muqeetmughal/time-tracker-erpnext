import screenshot from 'screenshot-desktop'
import path from 'path'
import os from 'node:os'
import fs from 'node:fs/promises'
import { getConfig } from '../store'
import { reviewImageBeforeUpload } from './image-review'
import type { AppConfig } from '../types'
import { ensureCaptureDir } from './capture-storage'

export type CapturedImage = {
  timestamp: string
  filePath: string
  approved: boolean
  rejected: boolean
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

async function moveCaptureFile(from: string, to: string) {
  try {
    await fs.rename(from, to)
  } catch {
    await fs.copyFile(from, to)
    await fs.unlink(from)
  }
}

async function captureToAppStorage(
  destinationDir: string,
  destinationName: string,
  screenId?: number,
) {
  const tempFile = path.join(os.tmpdir(), destinationName)
  const destinationFile = path.join(destinationDir, destinationName)
  const capturedFile = await screenshot({
    filename: tempFile,
    ...(screenId === undefined ? {} : { screen: screenId }),
  })

  await moveCaptureFile(capturedFile, destinationFile)

  return destinationFile
}

export async function captureScreenshotsDetailed(config = getConfig()) {
  if (!config.general.takeScreenshots) {
    return []
  }

  const dir = await ensureCaptureDir('screenshots')
  const timestamp = Date.now()

  if (config.trackingSources.screenshotsFrom === 'all') {
    const displays = await screenshot.listDisplays()
    const files = await Promise.all(
      displays.map(async (display, index) => {
        return captureToAppStorage(
          dir,
          `${timestamp}-${index}.jpg`,
          Number(display.id),
        )
      })
    )

    return Promise.all(files.map((file) => reviewCapturedFile(file, config)))
  }

  const file = await captureToAppStorage(
    dir,
    `${timestamp}.jpg`
  )

  return [await reviewCapturedFile(file, config)]
}

export async function captureScreenshot() {
  const captures = await captureScreenshotsDetailed()

  return captures
    .filter((capture) => capture.approved)
    .map((capture) => capture.filePath)
}
