/**
 * 从 QQ 邮箱中提取 QQ 号
 * @param {string} email - QQ 邮箱地址
 * @returns {string|null} 提取的 QQ 号或 null
 */
export function extractQQFromEmail(email) {
  if (!email) return null;
  
  // 标准 QQ 邮箱格式：数字@qq.com
  const qqEmailRegex = /^(\d+)@qq\.com$/i;
  const match = email.match(qqEmailRegex);
  
  return match ? match[1] : null;
}

/**
 * 获取 QQ 头像 URL
 * @param {string} qqNumber - QQ 号码
 * @param {number} size - 头像大小，默认 100
 * @returns {string} 头像 URL
 */
export function getQQAvatarUrl(qqNumber, size = 100) {
  if (!qqNumber) return null;
  return `https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=${size}`;
}

/**
 * 从 QQ 邮箱直接获取头像 URL
 * @param {string} email - QQ 邮箱地址
 * @param {number} size - 头像大小，默认 100
 * @returns {string|null} 头像 URL 或 null
 */
export function getAvatarFromEmail(email, size = 100) {
  const qqNumber = extractQQFromEmail(email);
  return qqNumber ? getQQAvatarUrl(qqNumber, size) : null;
} 