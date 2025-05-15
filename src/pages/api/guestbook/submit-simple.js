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
  REDIRECT: () => new Response('', {
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

export const prerender = false;

export async function POST({ request }) {
  try {
    // 尝试解析表单数据
    const formData = await request.formData();
    
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
    
    // 准备插入的数据
    const messageData = {
      nickname: safeNickname,
      content: safeContent,
      qq_email: safeEmail,
      background_color: bgColor,
      text_color: textColor,
      border_style: borderStyle,
      ip_hash: formData.get('ip_hash') || `anon-${Date.now()}`
    };
    
    // 每次调用函数创建新的响应对象，而不是克隆缓存的响应
    const redirectResponse = RESPONSES.REDIRECT();
    
    // 在后台异步处理数据库操作
    (async () => {
      try {
        // 插入到Supabase
        await supabase
          .from('guestbook_messages')
          .insert([messageData]);
      } catch (backgroundError) {
        console.error("后台数据库操作错误:", backgroundError);
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