# 留言板功能实现

本文档记录了博客留言板功能的实现细节和配置步骤。

## 技术栈

- **前端**: 纯 HTML/CSS/JS + Masonry.js 瀑布流布局
- **后端**: Supabase (PostgreSQL + REST API)
- **安全验证**: Cloudflare Turnstile
- **头像系统**: QQ 邮箱自动解析 + QQ 头像 API

## 环境变量配置

在项目根目录创建 `.env` 文件，添加以下内容：

```
# Supabase 配置
PUBLIC_SUPABASE_URL=your-supabase-project-url
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Cloudflare Turnstile 配置
PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
```

## 安装依赖

```bash
pnpm add @supabase/supabase-js masonry-layout
```

## Supabase 数据库设置

1. 创建 `guestbook_messages` 表，包含以下字段：
   - `id` (UUID, 主键)
   - `created_at` (Timestamp with time zone)
   - `nickname` (Text, 必填)
   - `qq_email` (Text, 可选)
   - `content` (Text, 必填)
   - `background_color` (Text, 默认 "#ffffff")
   - `text_color` (Text, 默认 "#000000")
   - `border_style` (Text, 默认 "solid")
   - `ip_hash` (Text, 必填)

2. 配置 Row Level Security (RLS) 策略:
   - 创建读取策略 (允许所有人查看留言)
   - 创建写入策略 (使用 Turnstile 验证)

## Cloudflare Turnstile 配置

1. 在 Cloudflare 仪表盘中创建 Turnstile 站点
2. 选择"Invisible"类型（无感知验证）
3. 获取 Site Key 和 Secret Key
4. 将这些密钥添加到 `.env` 文件

## 功能特点

- 瀑布流布局展示留言
- 滚动加载动画效果
- QQ 头像自动获取
- 留言样式自定义
- 留言预览功能
- 防刷验证

## 文件结构

- `/src/components/GuestBook/GuestbookForm.astro` - 留言提交表单
- `/src/components/GuestBook/GuestbookWall.astro` - 留言墙瀑布流展示
- `/src/pages/guestbook.astro` - 留言板页面
- `/src/pages/api/guestbook/submit.js` - 提交留言 API
- `/src/pages/api/guestbook/get-messages.js` - 获取留言 API
- `/src/lib/supabase.js` - Supabase 客户端配置
- `/src/utils/qq-avatar.js` - QQ 头像工具函数
- `/src/utils/ip-hash.js` - IP 哈希工具函数 