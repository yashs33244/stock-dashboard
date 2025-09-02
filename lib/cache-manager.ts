export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  key: string
}

export interface CacheConfig {
  defaultTTL: number // Time to live in milliseconds
  maxSize: number // Maximum number of entries
  cleanupInterval: number // Cleanup interval in milliseconds
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private config: CacheConfig
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 30000, // 30 seconds default
      maxSize: 1000,
      cleanupInterval: 60000, // 1 minute
      ...config,
    }

    this.startCleanup()
  }

  // Generate cache key from parameters
  private generateKey(provider: string, method: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = params[key]
          return result
        },
        {} as Record<string, any>,
      )

    return `${provider}:${method}:${JSON.stringify(sortedParams)}`
  }

  // Set data in cache
  set<T>(provider: string, method: string, params: Record<string, any>, data: T, ttl?: number): void {
    const key = this.generateKey(provider, method, params)
    const now = Date.now()
    const expiresAt = now + (ttl || this.config.defaultTTL)

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
      key,
    })
  }

  // Get data from cache
  get<T>(provider: string, method: string, params: Record<string, any>): T | null {
    const key = this.generateKey(provider, method, params)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  // Check if data exists and is valid
  has(provider: string, method: string, params: Record<string, any>): boolean {
    const key = this.generateKey(provider, method, params)
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredEntries++
      } else {
        validEntries++
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.config.maxSize,
      hitRate: this.getHitRate(),
    }
  }

  // Clear expired entries
  cleanup(): number {
    const now = Date.now()
    let removedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        removedCount++
      }
    }

    return removedCount
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Invalidate specific cache entries
  invalidate(provider?: string, method?: string): void {
    if (!provider && !method) {
      this.clear()
      return
    }

    const keysToDelete: string[] = []
    for (const [key] of this.cache.entries()) {
      const parts = key.split(":")
      if (provider && parts[0] !== provider) continue
      if (method && parts[1] !== method) continue
      keysToDelete.push(key)
    }

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  // Private methods
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private hitRate = { hits: 0, misses: 0 }

  private getHitRate(): number {
    const total = this.hitRate.hits + this.hitRate.misses
    return total > 0 ? this.hitRate.hits / total : 0
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}

// Global cache instance
export const globalCache = new CacheManager({
  defaultTTL: 30000, // 30 seconds
  maxSize: 500,
  cleanupInterval: 60000, // 1 minute
})
