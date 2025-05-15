import { createClient } from '@supabase/supabase-js';
import sanitizeHtml from 'sanitize-html';

// Supabase配置
const supabaseUrl = "https://phbwtexlsszkeotrrmws.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYnd0ZXhsc3N6a2VvdHJybXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMDc3MjUsImV4cCI6MjA2Mjc4MzcyNX0.D7Tt-qL0wZRqHKpR3fOUjse4sp_Z4ixTFBTd_Y0IZvw";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST({ request }) {
  // 响应头设置
  const headers = {
    'Content-Type': 'application/json'
  };
  
  try {
    // 读取原始文本
    const bodyText = await request.text();
    console.log('原始请求体:', bodyText);
    
    // 手动解析JSON
    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (e) {
      console.error('JSON解析错误:', e);
      return new Response(JSON.stringify({
        success: false,
        error: '无效的JSON格式: ' + e.message
      }), { 
        status: 400, 
        headers 
      });
    }
    
    // 验证必填字段
    if (!data.nickname || !data.content) {
      return new Response(JSON.stringify({
        success: false,
        error: '昵称和内容为必填项'
      }), { 
        status: 400, 
        headers 
      });
    }
    
    // 准备数据
    const messageData = {
      nickname: sanitizeHtml(data.nickname),
      content: sanitizeHtml(data.content),
      qq_email: data.qq_email || null,
      background_color: data.background_color || '#f9fafb',
      text_color: data.text_color || '#374151',
      border_style: data.border_style || 'solid',
      ip_hash: `anon-${Date.now()}`
    };
    
    console.log('处理后的数据:', messageData);
    
    // 插入到Supabase
    try {
      const { data: result, error } = await supabase
        .from('guestbook_messages')
        .insert([messageData]);
      
      if (error) {
        console.error('Supabase错误:', error);
        return new Response(JSON.stringify({
          success: false,
          error: '数据库错误: ' + error.message
        }), { 
          status: 500, 
          headers 
        });
      }
      
      // 成功响应
      return new Response(JSON.stringify({
        success: true,
        message: '留言提交成功'
      }), { 
        status: 200, 
        headers 
      });
    } catch (dbError) {
      console.error('数据库操作错误:', dbError);
      return new Response(JSON.stringify({
        success: false,
        error: '数据库操作失败: ' + dbError.message
      }), { 
        status: 500, 
        headers 
      });
    }
  } catch (error) {
    console.error('服务器错误:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '服务器错误: ' + error.message
    }), { 
      status: 500, 
      headers 
    });
  }
} 