// 这个文件在静态模式下不会被使用
// 所有提交都通过客户端JavaScript直接向Supabase发送

export function POST() {
  // 这个函数在静态生成时会被调用，但实际上不会处理任何请求
  return new Response('这个API在静态模式下不可用，请使用客户端直接提交', {
    status: 404
  });
}

// 标记为静态预渲染
export const prerender = true; 