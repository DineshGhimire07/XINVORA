import { IngestEvent } from "../../events/registry"

export interface AnalyticsQueue {
  enqueue(event: IngestEvent): Promise<void>
  dequeue(batchSize: number): Promise<IngestEvent[]>
  size(): Promise<number>
}
