import { createClient } from '@supabase/supabase-js';
import sanitizeHtml from 'sanitize-html';

// Supabase配置
const supabaseUrl = "https://phbwtexlsszkeotrrmws.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYnd0ZXhsc3N6a2VvdHJybXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMDc3MjUsImV4cCI6MjA2Mjc4MzcyNX0.D7Tt-qL0wZRqHKpR3fOUjse4sp_Z4ixTFBTd_Y0IZvw";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST({ request }) {
  // 设置响应头
  const headers = {
    'Content-Type': 'application/json'
  };
  
  try {
    console.log("处理表单提交请求...");
    
    // 获取请求内容类型
    const contentType = request.headers.get('Content-Type') || '';
    console.log("Content-Type:", contentType);
    
    // 默认数据对象
    let data = {};
    
    try {
      if (contentType.includes('multipart/form-data')) {
        // 处理表单数据
        const formData = await request.formData();
        console.log("成功解析FormData");
        
        // 将FormData转换为对象
        for (const [key, value] of formData.entries()) {
          data[key] = value;
        }
        
        console.log("FormData对象:", data);
      } else {
        // 其他情况，尝试直接读取和解析请求体
        const text = await request.text();
        console.log("原始请求体:", text);
        
        try {
          // 尝试作为JSON解析
          data = JSON.parse(text);
        } catch (e) {
          // 不是JSON，尝试作为url编码的表单数据解析
          text.split('&').forEach(pair => {
            if (!pair) return;
            const [key, value] = pair.split('=');
            if (key) {
              data[decodeURIComponent(key)] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
            }
          });
        }
      }
    } catch (parseError) {
      console.error("解析请求数据错误:", parseError);
      return new Response(JSON.stringify({
        success: false,
        error: '无法解析请求数据: ' + parseError.message
      }), { status: 400, headers });
    }
    
    // 打印解析后的数据
    console.log("解析后的数据:", data);
    
    // 验证必填字段
    if (!data.nickname || !data.content) {
      console.log("缺少必填字段");
      return new Response(JSON.stringify({
        success: false,
        error: '昵称和内容为必填项'
      }), { status: 400, headers });
    }
    
    // 准备要插入的数据
    const messageData = {
      nickname: sanitizeHtml(String(data.nickname || '')),
      content: sanitizeHtml(String(data.content || '')),
      qq_email: data.qq_email || null,
      background_color: String(data.background_color || '#ffffff'),
      text_color: String(data.text_color || '#000000'),
      border_style: String(data.border_style || 'solid'),
      ip_hash: String(data.ip_hash || `anon-${Date.now()}`)
    };
    
    console.log("处理后的数据:", messageData);
    
    // 插入数据到Supabase
    const { data: result, error } = await supabase
      .from('guestbook_messages')
      .insert([messageData]);
    
    if (error) {
      console.error("数据库错误:", error);
      return new Response(JSON.stringify({
        success: false,
        error: '数据库错误: ' + error.message
      }), { status: 500, headers });
    }
    
    // 成功响应
    console.log("数据插入成功");
    return new Response(JSON.stringify({
      success: true,
      message: '留言提交成功'
    }), { status: 200, headers });
    
  } catch (error) {
    console.error("服务器错误:", error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器错误: ' + error.message
    }), { status: 500, headers });
  }
} 