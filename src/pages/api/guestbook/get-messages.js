import { createClient } from '@supabase/supabase-js';

// 直接使用硬编码的Supabase凭据
const supabaseUrl = "https://phbwtexlsszkeotrrmws.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYnd0ZXhsc3N6a2VvdHJybXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMDc3MjUsImV4cCI6MjA2Mjc4MzcyNX0.D7Tt-qL0wZRqHKpR3fOUjse4sp_Z4ixTFBTd_Y0IZvw";

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET({ request }) {
  // 标准headers
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=60'
  };
  
  try {
    // 获取分页参数
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    
    // 限制页面大小
    const limitedPageSize = Math.min(pageSize, 50);
    const from = page * limitedPageSize;
    const to = from + limitedPageSize - 1;
    
    // 查询数据
    const { data, error } = await supabase
      .from('guestbook_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error("获取留言失败:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `获取留言失败: ${error.message}`
        }),
        { status: 500, headers: { ...headers, 'Cache-Control': 'no-cache' } }
      );
    }
    
    // 确保data是数组并处理数据
    const safeData = Array.isArray(data) ? data : [];
    
    // 处理数据，确保敏感信息不被泄露
    const processedData = safeData.map(message => ({
      id: message.id,
      nickname: message.nickname || '匿名',
      content: message.content || '',
      created_at: message.created_at,
      qq_email: message.qq_email ? message.qq_email.split('@')[0] + '@qq.com' : null,
      background_color: message.background_color || '#f9fafb',
      text_color: message.text_color || '#374151',
      border_style: message.border_style || 'solid'
    }));
    
    // 返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
        data: processedData,
        pagination: {
          page,
          pageSize: limitedPageSize,
          hasMore: safeData.length === limitedPageSize
        }
      }),
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error("获取留言异常:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: `服务器错误: ${error.message}`
      }),
      { status: 500, headers: { ...headers, 'Cache-Control': 'no-cache' } }
    );
  }
} 