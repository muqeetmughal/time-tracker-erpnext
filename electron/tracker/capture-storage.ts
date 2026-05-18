import { app } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { listUploadedMediaFiles, markMediaFileDeleted } from "../db";

export function getCaptureDir(kind: "screenshots" | "camshots") {
  return path.join(app.getPath("userData"), "captures", kind);
}

export async function ensureCaptureDir(kind: "screenshots" | "camshots") {
  const dir = getCaptureDir(kind);

  await fs.mkdir(dir, { recursive: true });

  return dir;
}

export async function cleanupUploadedCaptureFiles(limit = 100) {
  const mediaFiles = listUploadedMediaFiles(limit);

  await Promise.all(
    mediaFiles.map(async (media) => {
      try {
        await fs.unlink(media.filePath);
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !("code" in error) ||
          error.code !== "ENOENT"
        ) {
          console.warn("Unable to delete uploaded media file:", error);
          return;
        }
      }

      markMediaFileDeleted(media.id);
    }),
  );
}
