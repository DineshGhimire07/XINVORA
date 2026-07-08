import Redis from "ioredis"
import { AnalyticsQueue } from "./interface"
import { IngestEvent } from "../../events/registry"

export class RedisAnalyticsQueue implements AnalyticsQueue {
  private redis: Redis
  private listKey = "xinvora:analytics:queue"

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl)
  }

  public async enqueue(event: IngestEvent): Promise<void> {
    await this.redis.lpush(this.listKey, JSON.stringify(event))
  }

  public async dequeue(batchSize: number): Promise<IngestEvent[]> {
    const pipeline = this.redis.pipeline()
    pipeline.lrange(this.listKey, 0, batchSize - 1)
    pipeline.ltrim(this.listKey, batchSize, -1)
    
    const results = await pipeline.exec()
    if (!results || !results[0] || results[0][0]) return []
    
    const eventsStr = results[0][1] as string[]
    return eventsStr.map(str => JSON.parse(str) as IngestEvent)
  }

  public async size(): Promise<number> {
    return await this.redis.llen(this.listKey)
  }
}
