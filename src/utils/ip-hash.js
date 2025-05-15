/**
 * 生成 IP 地址的安全哈希值
 * 注意：这是一个简化的实现，实际生产环境可能需要更复杂的策略
 * 
 * @param {string} ip - 用户 IP 地址
 * @param {string} salt - 用于增加安全性的盐值
 * @returns {string} 哈希后的字符串
 */
export async function hashIP(ip, salt = 'guestbook-salt') {
  // 将 IP 与盐值组合
  const data = ip + salt;
  
  // 使用 Web Crypto API 生成哈希
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
  
  // 将哈希值转换为十六进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // 只返回哈希的一部分，进一步保护隐私
  return hashHex.substring(0, 16);
}

/**
 * 生成当前时间的日期字符串 (YYYY-MM-DD)
 * 用于限制每日留言次数
 */
export function getCurrentDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}

/**
 * 生成包含日期的 IP 哈希
 * 可用于限制用户每日留言次数
 */
export async function getDailyIPHash(ip) {
  const dateString = getCurrentDateString();
  return hashIP(ip + dateString);
} 