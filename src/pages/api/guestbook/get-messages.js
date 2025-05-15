// 使用静态导出替代服务器API路由
// 提供默认数据让静态网站可以正常工作

// 静态默认留言数据
const defaultMessages = [
  {
    id: 'default-1',
    nickname: '示例用户',
    content: '这是一条示例留言，当没有真实留言时显示。留言可以很长，这样可以测试留言框的大小和布局效果。希望这个留言墙能够收集到更多美好的留言！',
    created_at: new Date().toISOString(),
    background_color: '#f0f9ff',
    text_color: '#0369a1',
    border_style: 'solid',
    qq_email: '',
    location: '北京市'
  },
  {
    id: 'default-2',
    nickname: '示例用户2',
    content: '欢迎使用留言墙，可以向博主分享你的想法、建议或者仅仅是打个招呼。期待看到你的留言！',
    created_at: new Date().toISOString(),
    background_color: '#fff7ed',
    text_color: '#c2410c',
    border_style: 'solid',
    qq_email: '',
    location: '广东 · 深圳'
  },
  {
    id: 'default-3',
    nickname: '示例用户3',
    content: '留言墙支持鼠标滚轮滑动，体验更加流畅。这是一个很好的交流平台，可以与博主和其他访客进行互动。如果你有什么想说的，请点击下方按钮留言！',
    created_at: new Date().toISOString(),
    background_color: '#f0fdf4',
    text_color: '#166534',
    border_style: 'solid',
    qq_email: '',
    location: '海外 · 美国'
  }
];

// 静态API响应
export function GET() {
  return new Response(
    JSON.stringify({
      success: true,
      data: defaultMessages,
      pagination: {
        page: 0,
        pageSize: 20,
        total: defaultMessages.length,
        hasMore: false
      }
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// 强制设置为静态预渲染
export const prerender = true; 