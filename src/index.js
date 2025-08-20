
// 导入 mmdb-lib 类库
import { Reader } from './lib/index.js';


/**
 * 全局变量存储 MMDB Reader 实例
 */
let mmdbReader = null;

/**
 * 缓存键生成函数
 */
function getCacheKey(type, identifier) {
  return `https://cache.internal/${type}/${identifier}`;
}

/**
 * 从 R2 获取 MMDB 文件
 */
async function getMmdbFromR2(env) {
  try {
    const object = await env.GEO_BUCKET.get(env.MMDB_PATH);
    if (!object) {
      throw new Error('MMDB file not found in R2 bucket');
    }
    return await object.arrayBuffer();
  } catch (error) {
    console.error('Error fetching MMDB from R2:', error);
    throw error;
  }
}

/**
 * 获取缓存的 MMDB 数据或从 R2 下载
 */
async function getCachedMmdb(env) {
  const cacheKey = getCacheKey('mmdb', 'geolite2-city');
  const cache = caches.default;
  
  try {
    // 尝试从缓存获取
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      console.log('Using cached MMDB data');
      return await cachedResponse.arrayBuffer();
    }
  } catch (error) {
    console.warn('Error accessing cache:', error);
  }

  // 缓存未命中，从 R2 获取
  console.log('Cache miss, fetching MMDB from R2');
  const mmdbBuffer = await getMmdbFromR2(env);
  
  try {
    // 创建响应对象并缓存到 Cache API
    const response = new Response(mmdbBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': `public, max-age=${env.CACHE_TTL || 86400}`,
        'Last-Modified': new Date().toUTCString()
      }
    });
    
    // 将数据缓存
    await cache.put(cacheKey, response.clone());
    console.log('MMDB data cached successfully');
  } catch (error) {
    console.warn('Error caching MMDB data:', error);
  }

  return mmdbBuffer;
}

/**
 * 初始化或获取 MMDB Reader 实例
 */
async function getMmdbReader(env) {
  if (mmdbReader) {
    return mmdbReader;
  }

  try {
    console.log('Initializing MMDB Reader...');
    
    // 获取 MMDB 文件
    const mmdbBuffer = await getCachedMmdb(env);
    
    // 创建 Buffer 实例（mmdb-lib 需要 Buffer）
    const { Buffer } = require("buffer");
    const buffer = Buffer.from(mmdbBuffer);
    
    // 创建 Reader 实例
    mmdbReader = new Reader(buffer);
    console.log('MMDB Reader instance created successfully');
    
    return mmdbReader;
  } catch (error) {
    console.error('Error creating MMDB Reader instance:', error);
    throw new Error('MMDB Reader initialization failed: ' + error.message);
  }
}

/**
 * 验证 IP 地址格式
 */
function isValidIP(ip) {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * 获取客户端 IP 地址
 */
function getClientIP(request) {
  // 按优先级检查各种头部
  const headers = [
    'CF-Connecting-IP',
    'X-Forwarded-For',
    'X-Real-IP',
    'X-Client-IP'
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // X-Forwarded-For 可能包含多个 IP，取第一个
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  // 如果没有找到有效的 IP，返回默认值
  return '127.0.0.1';
}

/**
 * 获取缓存的 IP 查询结果
 */
async function getCachedIPResult(ip) {
  const cacheKey = getCacheKey('ip', ip);
  const cache = caches.default;
  
  try {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse && cachedResponse.ok) {
      console.log(`Using cached result for IP: ${ip}`);
      return await cachedResponse.json();
    }
  } catch (error) {
    console.warn('Error accessing IP cache:', error);
  }
  
  return null;
}

/**
 * 缓存 IP 查询结果
 */
async function cacheIPResult(ip, result) {
  const cacheKey = getCacheKey('ip', ip);
  const cache = caches.default;
  
  try {
    const response = new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // IP 查询结果缓存 1 小时
        'Last-Modified': new Date().toUTCString()
      }
    });
    
    await cache.put(cacheKey, response);
    console.log(`Cached result for IP: ${ip}`);
  } catch (error) {
    console.warn('Error caching IP result:', error);
  }
}

/**
 * 查询 IP 地理位置信息
 */
async function lookupIP(ip, reader) {
  try {
    // 使用 mmdb-lib 的 get 方法查询 IP
    const result = reader.get(ip);
    
    if (!result) {
      return {
        ip,
        error: 'IP not found in database'
      };
    }

    // 格式化返回数据
    const locationData = {
      ip,
      country: {
        iso_code: result.country?.iso_code || null,
        name: result.country?.names?.en || null,
        name_zh: result.country?.names?.['zh-CN'] || result.country?.names?.zh || null
      },
      city: {
        name: result.city?.names?.en || null,
        name_zh: result.city?.names?.['zh-CN'] || result.city?.names?.zh || null
      },
      subdivisions: result.subdivisions?.map(sub => ({
        iso_code: sub.iso_code,
        name: sub.names?.en || null,
        name_zh: sub.names?.['zh-CN'] || sub.names?.zh || null
      })) || [],
      location: {
        latitude: result.location?.latitude || null,
        longitude: result.location?.longitude || null,
        accuracy_radius: result.location?.accuracy_radius || null,
        time_zone: result.location?.time_zone || null
      },
      postal: {
        code: result.postal?.code || null
      },
      continent: {
        code: result.continent?.code || null,
        name: result.continent?.names?.en || null,
        name_zh: result.continent?.names?.['zh-CN'] || result.continent?.names?.zh || null
      }
    };

    return locationData;
  } catch (error) {
    console.error('Error looking up IP:', error);
    return {
      ip,
      error: 'Failed to lookup IP: ' + error.message
    };
  }
}

/**
 * 处理 CORS
 */
function addCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

/**
 * 主处理函数
 */
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return addCorsHeaders(new Response(null, { status: 200 }));
    }

    // 只允许 GET 请求
    if (request.method !== 'GET') {
      return addCorsHeaders(new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // 提取 IP 地址
      let targetIP;
      if (path === '/' || path === '') {
        // 没有参数，返回客户端 IP 信息
        targetIP = getClientIP(request);
      } else {
        // 从路径中提取 IP
        const ipFromPath = path.substring(1); // 移除开头的 '/'
        if (isValidIP(ipFromPath)) {
          targetIP = ipFromPath;
        } else {
          return addCorsHeaders(new Response(JSON.stringify({
            error: 'Invalid IP address format'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }

      // 检查 IP 查询结果缓存
      let result = await getCachedIPResult(targetIP);
      
      if (!result) {
        // 获取 MMDB Reader 实例
        const reader = await getMmdbReader(env);
        
        // 查询 IP 信息
        result = await lookupIP(targetIP, reader);
        
        // 如果查询成功且不是错误结果，缓存结果
        if (result && !result.error) {
          await cacheIPResult(targetIP, result);
        }
      }

      // 返回结果
      return addCorsHeaders(new Response(JSON.stringify(result, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // 1小时缓存
        }
      }));

    } catch (error) {
      console.error('Worker error:', error);
      return addCorsHeaders(new Response(JSON.stringify({
        error: 'Internal server error: ' + error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  }
};
