import { AnalyticsQueue } from "./interface"
import { IngestEvent } from "../../events/registry"

export class InMemoryAnalyticsQueue implements AnalyticsQueue {
  private queue: IngestEvent[] = []

  public async enqueue(event: IngestEvent): Promise<void> {
    this.queue.push(event)
  }

  public async dequeue(batchSize: number): Promise<IngestEvent[]> {
    return this.queue.splice(0, batchSize)
  }

  public async size(): Promise<number> {
    return this.queue.length
  }
}
