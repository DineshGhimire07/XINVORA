type EventCallback = (data: any) => void

class ApplicationEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map()

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data)
        } catch (err) {
          console.error(`[EventBus] Error handling event ${event}:`, err)
        }
      })
    }
  }
}

export const eventBus = new ApplicationEventBus()
