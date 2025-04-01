import { Redis } from '@upstash/redis'
import { createClient, RedisClientType } from 'redis'

export type RedisConfig = {
  useLocalRedis: boolean
  upstashRedisRestUrl?: string
  upstashRedisRestToken?: string
  localRedisUrl?: string
  kvRestApiUrl?: string
  kvRestApiToken?: string
  kvRestApiReadOnlyToken?: string
  kvUrl?: string
  redisUrl?: string
}

export const redisConfig: RedisConfig = {
  useLocalRedis: process.env.USE_LOCAL_REDIS === 'true',
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
  localRedisUrl: process.env.LOCAL_REDIS_URL || process.env.REDIS_URL || process.env.KV_URL || 'redis://localhost:6379',
  kvRestApiUrl: process.env.KV_REST_API_URL,
  kvRestApiToken: process.env.KV_REST_API_TOKEN,
  kvRestApiReadOnlyToken: process.env.KV_REST_API_READ_ONLY_TOKEN,
  kvUrl: process.env.KV_URL,
  redisUrl: process.env.REDIS_URL
}

let localRedisClient: RedisClientType | null = null
let redisWrapper: RedisWrapper | null = null

// Wrapper class for Redis client
export class RedisWrapper {
  private client: Redis | RedisClientType

  constructor(client: Redis | RedisClientType) {
    this.client = client
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    options?: { rev: boolean }
  ): Promise<string[]> {
    let result: string[]
    if (this.client instanceof Redis) {
      result = await this.client.zrange(key, start, stop, options)
    } else {
      const redisClient = this.client as RedisClientType
      if (options?.rev) {
        result = await redisClient.zRange(key, start, stop, { REV: true })
      } else {
        result = await redisClient.zRange(key, start, stop)
      }
    }
    return result
  }

  async hgetall<T extends Record<string, unknown>>(
    key: string
  ): Promise<T | null> {
    if (this.client instanceof Redis) {
      return this.client.hgetall(key) as Promise<T | null>
    } else {
      const result = await (this.client as RedisClientType).hGetAll(key)
      return Object.keys(result).length > 0 ? (result as T) : null
    }
  }

  pipeline() {
    return this.client instanceof Redis
      ? new UpstashPipelineWrapper(this.client.pipeline())
      : new LocalPipelineWrapper((this.client as RedisClientType).multi())
  }

  async hmset(key: string, value: Record<string, any>): Promise<'OK' | number> {
    if (this.client instanceof Redis) {
      return this.client.hmset(key, value)
    } else {
      return (this.client as RedisClientType).hSet(key, value)
    }
  }

  async zadd(
    key: string,
    score: number,
    member: string
  ): Promise<number | null> {
    if (this.client instanceof Redis) {
      return this.client.zadd(key, { score, member })
    } else {
      return (this.client as RedisClientType).zAdd(key, {
        score,
        value: member
      })
    }
  }

  async del(key: string): Promise<number> {
    if (this.client instanceof Redis) {
      return this.client.del(key)
    } else {
      return (this.client as RedisClientType).del(key)
    }
  }

  async zrem(key: string, member: string): Promise<number> {
    if (this.client instanceof Redis) {
      return this.client.zrem(key, member)
    } else {
      return (this.client as RedisClientType).zRem(key, member)
    }
  }

  async close(): Promise<void> {
    if (this.client instanceof Redis) {
      // Upstash Redis doesn't require explicit closing
      return
    } else {
      await (this.client as RedisClientType).quit()
    }
  }
}

// Wrapper class for Upstash Redis pipeline
class UpstashPipelineWrapper {
  private pipeline: ReturnType<Redis['pipeline']>

  constructor(pipeline: ReturnType<Redis['pipeline']>) {
    this.pipeline = pipeline
  }

  hgetall(key: string) {
    this.pipeline.hgetall(key)
    return this
  }

  del(key: string) {
    this.pipeline.del(key)
    return this
  }

  zrem(key: string, member: string) {
    this.pipeline.zrem(key, member)
    return this
  }

  hmset(key: string, value: Record<string, any>) {
    this.pipeline.hmset(key, value)
    return this
  }

  zadd(key: string, score: number, member: string) {
    this.pipeline.zadd(key, { score, member })
    return this
  }

  async exec() {
    try {
      return await this.pipeline.exec()
    } catch (error) {
      throw error
    }
  }
}

// Wrapper class for local Redis pipeline
class LocalPipelineWrapper {
  private pipeline: ReturnType<RedisClientType['multi']>

  constructor(pipeline: ReturnType<RedisClientType['multi']>) {
    this.pipeline = pipeline
  }

  hgetall(key: string) {
    this.pipeline.hGetAll(key)
    return this
  }

  del(key: string) {
    this.pipeline.del(key)
    return this
  }

  zrem(key: string, member: string) {
    this.pipeline.zRem(key, member)
    return this
  }

  hmset(key: string, value: Record<string, any>) {
    // Convert all values to strings
    const stringValue = Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, String(v)])
    )
    this.pipeline.hSet(key, stringValue)
    return this
  }

  zadd(key: string, score: number, member: string) {
    this.pipeline.zAdd(key, { score, value: member })
    return this
  }

  async exec() {
    try {
      return await this.pipeline.exec()
    } catch (error) {
      throw error
    }
  }
}

// Function to get a Redis client
export async function getRedisClient(): Promise<RedisWrapper> {
  if (redisWrapper) {
    return redisWrapper
  }

  if (redisConfig.useLocalRedis) {
    if (!localRedisClient) {
      const localRedisUrl =
        redisConfig.localRedisUrl || 'redis://localhost:6379'
      try {
        localRedisClient = createClient({ url: localRedisUrl })
        await localRedisClient.connect()
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('ECONNREFUSED')) {
            console.error(
              `Failed to connect to local Redis at ${localRedisUrl}: Connection refused. Is Redis running?`
            )
          } else if (error.message.includes('ETIMEDOUT')) {
            console.error(
              `Failed to connect to local Redis at ${localRedisUrl}: Connection timed out. Check your network or Redis server.`
            )
          } else if (error.message.includes('ENOTFOUND')) {
            console.error(
              `Failed to connect to local Redis at ${localRedisUrl}: Host not found. Check your Redis URL.`
            )
          } else {
            console.error(
              `Failed to connect to local Redis at ${localRedisUrl}:`,
              error.message
            )
          }
        } else {
          console.error(
            `An unexpected error occurred while connecting to local Redis at ${localRedisUrl}:`,
            error
          )
        }
        throw new Error(
          'Failed to connect to local Redis. Check your configuration and ensure Redis is running.'
        )
      }
    }
    redisWrapper = new RedisWrapper(localRedisClient)
  } else {
    // Try to use Upstash Redis REST URL and token
    if (
      !redisConfig.upstashRedisRestUrl ||
      !redisConfig.upstashRedisRestToken
    ) {
      throw new Error(
        'Upstash Redis REST URL and token are required when USE_LOCAL_REDIS is false'
      )
    }
    
    try {
      const upstashRedis = new Redis({
        url: redisConfig.upstashRedisRestUrl,
        token: redisConfig.upstashRedisRestToken
      })
      
      // Test the connection
      await upstashRedis.ping()
      
      redisWrapper = new RedisWrapper(upstashRedis)
      console.log('Connected to Upstash Redis successfully')
    } catch (error) {
      console.error('Failed to connect to Upstash Redis:', error)
      throw new Error('Failed to connect to Upstash Redis. Check your configuration.')
    }
  }

  return redisWrapper
}

// Function to close the Redis connection
export async function closeRedisConnection(): Promise<void> {
  if (redisWrapper) {
    await redisWrapper.close()
    redisWrapper = null
  }
  if (localRedisClient) {
    await localRedisClient.quit()
    localRedisClient = null
  }
}
