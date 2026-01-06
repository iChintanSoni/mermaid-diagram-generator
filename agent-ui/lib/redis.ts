import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Use a singleton pattern to reuse the connection in development
declare global {
    var redis: Redis | undefined;
}

const redis = global.redis || new Redis(redisUrl);

if (process.env.NODE_ENV !== "production") {
    global.redis = redis;
}

export default redis;
