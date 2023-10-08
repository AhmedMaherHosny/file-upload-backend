import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
      password: '',
    });
    this.redisClient.on('ready', () => {
      Logger.log('Redis connection established');
    });
    this.redisClient.on('error', (error) => {
      Logger.error('Redis connection error:', error);
    });
  }

  async setValue(key: string, value: string) {
    await this.redisClient.set(key, value);
  }

  async getValue(key: string): Promise<string | null> {
    const value = await this.redisClient.get(key);
    return value;
  }

  async setHashItem(hashKey: string, field: string, value: string) {
    await this.redisClient.hset(hashKey, field, value);
  }

  async getHash(hashKey: string) {
    const hash = await this.redisClient.hgetall(hashKey);
    return hash;
  }

  async getHashItem(hashKey: string, field: string): Promise<string | null> {
    const value = await this.redisClient.hget(hashKey, field);
    return value;
  }

  async isKeyExist(hashKey: string, searchKey: string) {
    const exists = await this.redisClient.hexists(hashKey, searchKey);
    return exists;
  }

  async removeHashItem(hashKey: string, field: string) {
    await this.redisClient.hdel(hashKey, field);
  }
}
