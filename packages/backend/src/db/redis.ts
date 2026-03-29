import Redis from 'ioredis'

// 修改为：如果有远程地址用远程，没有才连本地（防止线上崩溃）
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL) 
  : new Redis({
      host: '127.0.0.1',
      port: 6379,
      lazyConnect: true, // 关键：延迟连接，不至于一启动就崩溃
      retryStrategy: () => null // 线上连不上就不重试了，避免一直转圈
    });

// 监听错误，防止进程崩溃
redis.on('error', (err) => {
  console.warn('[Redis] 连接失败，跳过缓存功能:', err.message);
});

export default redis;
