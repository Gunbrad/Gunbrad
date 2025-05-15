import { createClient } from '@supabase/supabase-js';

// 硬编码 Supabase URL 和匿名密钥，避免环境变量问题
const supabaseUrl = "https://phbwtexlsszkeotrrmws.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYnd0ZXhsc3N6a2VvdHJybXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMDc3MjUsImV4cCI6MjA2Mjc4MzcyNX0.D7Tt-qL0wZRqHKpR3fOUjse4sp_Z4ixTFBTd_Y0IZvw";

console.log('初始化Supabase客户端，URL:', supabaseUrl);

// 创建 Supabase 客户端
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false // 禁用会话持久化，简化认证
    }
  });
  console.log('Supabase客户端创建成功');
} catch (error) {
  console.error('Supabase客户端创建失败:', error);
  // 不抛出错误，让应用继续运行
  supabase = null;
}

// 获取留言列表函数
export async function getGuestbookMessages(page = 0, pageSize = 20) {
  console.log(`正在获取留言列表，页码: ${page}, 每页条数: ${pageSize}`);
  if (!supabase) {
    console.error('Supabase客户端未初始化，无法获取留言');
    return { data: [], error: { message: 'Supabase客户端未初始化' } };
  }
  
  const from = page * pageSize;
  const to = from + pageSize - 1;
  
  try {
    console.log(`执行查询: 范围 ${from}-${to}`);
    const { data, error } = await supabase
      .from('guestbook_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('获取留言列表失败:', error);
      return { data: [], error };
    }
    
    // 确保data是一个数组
    const safeData = Array.isArray(data) ? data : [];
    console.log(`成功获取${safeData.length}条留言`);
    return { data: safeData, error: null };
  } catch (error) {
    console.error('获取留言时发生异常:', error);
    return { data: [], error: { message: error.message || '未知错误' } };
  }
}

// 提交留言函数
export async function submitGuestbookMessage(message) {
  console.log('正在提交留言:', JSON.stringify(message));
  if (!supabase) {
    console.error('Supabase客户端未初始化，无法提交留言');
    return { data: null, error: { message: 'Supabase客户端未初始化' } };
  }
  
  try {
    console.log('执行插入操作');
    // 手动构建简单的提交数据，避免复杂引用
    const submitData = {
      nickname: String(message.nickname || ''),
      content: String(message.content || ''),
      ip_hash: String(message.ip_hash || '匿名'),
      qq_email: message.qq_email ? String(message.qq_email) : null,
      background_color: String(message.background_color || '#f9fafb'),
      text_color: String(message.text_color || '#374151'),
      border_style: String(message.border_style || 'solid')
    };
    
    const { data, error } = await supabase
      .from('guestbook_messages')
      .insert([submitData]);
    
    if (error) {
      console.error('提交留言失败:', error);
      return { data: null, error };
    }
    
    console.log('留言提交成功');
    return { data: { success: true }, error: null };
  } catch (error) {
    console.error('提交留言时发生异常:', error);
    return { data: null, error: { message: error.message || '未知错误' } };
  }
} 