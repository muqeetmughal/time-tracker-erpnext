type UploadItem = {
  id: number;
  filePath: string;
  attempts: number;
};

export class UploadQueueService {
  private queue: UploadItem[] = [];
  private isProcessing = false;

  enqueue(item: Omit<UploadItem, "attempts">) {
    this.queue.push({ ...item, attempts: 0 });
    void this.process();
  }

  private async process() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();

      if (!item) {
        continue;
      }

      try {
        await this.upload(item);
      } catch (error) {
        if (item.attempts < 3) {
          this.queue.push({ ...item, attempts: item.attempts + 1 });
        } else {
          console.error("Media upload failed:", error);
        }
      }
    }

    this.isProcessing = false;
  }

  private async upload(_item: UploadItem) {
    // ERPNext upload integration will plug in here. Keeping this async queue
    // separate prevents uploads from blocking capture or input tracking.
    await Promise.resolve();
  }
}
