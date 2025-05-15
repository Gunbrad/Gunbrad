import { createClient } from '@supabase/supabase-js';
import sanitizeHtml from 'sanitize-html';

// Supabase配置
const supabaseUrl = "https://phbwtexlsszkeotrrmws.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYnd0ZXhsc3N6a2VvdHJybXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMDc3MjUsImV4cCI6MjA2Mjc4MzcyNX0.D7Tt-qL0wZRqHKpR3fOUjse4sp_Z4ixTFBTd_Y0IZvw";

// 创建一个持久化的客户端实例
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }, // 不需要认证会话
  realtime: { enabled: false },    // 不需要实时功能
  global: { 
    fetch: customFetch   // 使用自定义fetch处理
  }
});

// 自定义fetch带有超时处理
function customFetch(url, options) {
  // 设置超时时间为8秒
  const timeout = 8000;
  
  // 创建一个abort controller
  const controller = new AbortController();
  options.signal = controller.signal;
  
  // 设置超时定时器
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // 执行fetch并清除超时
  return fetch(url, options)
    .then(response => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      throw error;
    });
}

// 简化的HTML清理选项，提高性能
const sanitizeOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  allowedAttributes: {
    'a': ['href', 'target']
  }
};

// 缓存常用的响应，减少响应时间
const RESPONSES = {
  REDIRECT: new Response('', {
    status: 302,
    headers: {
      'Location': '/guestbook',
      'Content-Type': 'text/html; charset=utf-8'
    }
  }),
  ERROR_REQUIRED: (message = '昵称和内容为必填项') => new Response(`
    <html>
      <head>
        <meta charset="UTF-8">
        <title>错误</title>
      </head>
      <body>
        <h1>错误</h1>
        <p>${message}</p>
        <a href="/guestbook">返回留言板</a>
      </body>
    </html>
  `, {
    status: 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
};

// 获取用户地理位置的函数
async function getUserLocation(ip) {
  try {
    // 使用免费的IP地理位置API
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) {
      throw new Error('无法获取地理位置信息');
    }
    
    const data = await response.json();
    
    // 提取省份/地区信息，优先使用中文地区名称
    let location = '';
    
    if (data.country_code === 'CN') {
      // 中国地区
      if (data.region) {
        // 移除"省"、"自治区"等后缀
        location = data.region.replace(/(省|自治区|特别行政区|市)$/, '');
        
        // 添加城市信息
        if (data.city && data.city !== data.region) {
          location += ' · ' + data.city;
        }
      } else if (data.city) {
        location = data.city;
      } else {
        location = '中国';
      }
    } else {
      // 国外地区
      if (data.country_name) {
        location = data.country_name;
        // 如果有城市信息，添加城市
        if (data.city) {
          location += ' · ' + data.city;
        }
      }
    }
    
    return location || '未知地区';
  } catch (error) {
    console.error('获取地理位置失败:', error);
    return '未知地区';
  }
}

// 提取客户端IP地址
function getClientIP(request) {
  // 尝试从各种请求头中获取IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for可能包含多个IP，取第一个
    return forwardedFor.split(',')[0].trim();
  }
  
  // 尝试其他常见的头
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // 如果无法获取客户端IP，返回一个占位符
  return '127.0.0.1';
}

export const prerender = false;

export async function POST({ request }) {
  try {
    // 先克隆请求以避免"Body already consumed"错误
    const clonedRequest = request.clone();
    
    // 尝试解析表单数据
    const formData = await clonedRequest.formData();
    
    // 提取主要字段
    const nickname = formData.get('nickname');
    const content = formData.get('content');
    
    // 基本验证
    if (!nickname || !content) {
      return RESPONSES.ERROR_REQUIRED();
    }
    
    // 只对必要字段进行清理
    const safeNickname = sanitizeHtml(nickname.toString(), sanitizeOptions);
    const safeContent = sanitizeHtml(content.toString(), sanitizeOptions);
    const safeEmail = formData.get('qq_email') ? formData.get('qq_email').toString() : '';
    
    // 其他字段简单验证而不用sanitize
    const bgColor = (formData.get('background_color') || '#ffffff').toString().slice(0, 20);
    const textColor = (formData.get('text_color') || '#000000').toString().slice(0, 20);
    const borderStyle = (formData.get('border_style') || 'solid').toString().slice(0, 20);
    
    // 获取客户端IP
    const clientIP = getClientIP(request);
    
    // 创建匿名的IP哈希值作为标识，但保留原始IP用于地理定位
    const ipHash = formData.get('ip_hash') || `anon-${Date.now()}`;
    
    // 创建一个新的重定向响应，而不是使用缓存的响应
    const redirectResponse = new Response('', {
      status: 302,
      headers: {
        'Location': '/guestbook',
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
    
    // 准备基本数据
    const messageData = {
      nickname: safeNickname,
      content: safeContent,
      qq_email: safeEmail,
      background_color: bgColor,
      text_color: textColor,
      border_style: borderStyle,
      ip_hash: ipHash,
      location: '正在获取...' // 默认值
    };
    
    // 在后台异步处理数据库操作和地理位置查询
    (async () => {
      try {
        // 先插入消息到数据库
        const { data, error } = await supabase
          .from('guestbook_messages')
          .insert([messageData]);
          
        if (error) {
          console.error("数据库插入错误:", error);
          return;
        }
        
        console.log("留言已保存，正在获取位置信息...");
        
        // 获取地理位置
        const location = await getUserLocation(clientIP);
        
        // 如果成功获取到地理位置，更新消息
        if (location && location !== '未知地区') {
          const { error: updateError } = await supabase
            .from('guestbook_messages')
            .update({ location })
            .eq('ip_hash', ipHash);
            
          if (updateError) {
            console.error("更新地理位置失败:", updateError);
          } else {
            console.log("留言地理位置已更新:", location);
          }
        }
      } catch (backgroundError) {
        console.error("后台处理错误:", backgroundError);
      }
    })();
    
    // 立即返回重定向响应，不等待数据库操作
    return redirectResponse;
    
  } catch (error) {
    console.error("处理请求错误:", error);
    return new Response(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>服务器错误</title>
        </head>
        <body>
          <h1>服务器错误</h1>
          <p>${error.message}</p>
          <a href="/guestbook">返回留言板</a>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
} 