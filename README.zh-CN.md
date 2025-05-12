# 🍥Fuwari

基于 [Astro](https://astro.build) 开发的静态博客模板。

[**🖥️在线预览（Vercel）**](https://fuwari.vercel.app)&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
[**📦旧 Hexo 版本**](https://github.com/saicaca/hexo-theme-vivia)

> README 版本：`2024-09-10`

![Preview Image](https://raw.githubusercontent.com/saicaca/resource/main/fuwari/home.png)

## ✨ 功能特性

- [x] 基于 Astro 和 Tailwind CSS 开发
- [x] 流畅的动画和页面过渡
- [x] 亮色 / 暗色模式
- [x] 自定义主题色和横幅图片
- [x] 响应式设计
- [x] 评论（Twikoo）
- [x] 搜索
- [ ] 文内目录

## 🚀 使用方法

1. 使用此模板[生成新仓库](https://github.com/saicaca/fuwari/generate)或 Fork 此仓库
2. 进行本地开发，Clone 新的仓库，执行 `pnpm install` 和 `pnpm add sharp` 以安装依赖  
   - 若未安装 [pnpm](https://pnpm.io)，执行 `npm install -g pnpm`
3. 通过配置文件 `src/config.ts` 自定义博客
4. 执行 `pnpm new-post <filename>` 创建新文章，并在 `src/content/posts/` 目录中编辑
5. 参考[官方指南](https://docs.astro.build/zh-cn/guides/deploy/)将博客部署至 Vercel, Netlify, GitHub Pages 等；部署前需编辑 `astro.config.mjs` 中的站点设置。

## ⚙️ 文章 Frontmatter

```yaml
---
title: My First Blog Post
published: 2023-09-09
description: This is the first post of my new Astro blog.
image: ./cover.jpg
tags: [Foo, Bar]
category: Front-end
draft: false
lang: jp      # 仅当文章语言与 `config.ts` 中的网站语言不同时需要设置
---
```

## 💬 配置Twikoo评论系统

1. 注册并登录 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. 创建免费的共享数据库 (M0)
3. 在"Security" > "Database Access"中创建数据库用户
4. 在"Security" > "Network Access"中，添加 `0.0.0.0/0` 到允许列表（或者限制为你的Vercel服务器IP）
5. 获取MongoDB连接字符串：在"Database"页面点击"Connect"，选择"Connect your application"，复制连接字符串
6. 将连接字符串中的`<password>`替换为你设置的密码
7. 前往[Vercel](https://vercel.com)创建新项目
8. 在项目设置的"Environment Variables"中，添加变量`MONGODB_URI`，值为MongoDB连接字符串
9. Fork [Twikoo云函数仓库](https://github.com/imaegoo/twikoo)
10. 在Vercel中导入该仓库，然后部署
11. 部署完成后，访问`https://你的域名.vercel.app/`，检查是否显示Twikoo运行正常的提示
12. 在博客配置文件`src/config.ts`中修改`commentConfig`：
```js
export const commentConfig: CommentConfig = {
  enable: true,
  system: 'twikoo',
  twikoo: {
    envId: 'https://你的域名.vercel.app/',
  }
};
```

## 🧞 指令

下列指令均需要在项目根目录执行：

| Command                           | Action                            |
|:----------------------------------|:----------------------------------|
| `pnpm install` 并 `pnpm add sharp` | 安装依赖                              |
| `pnpm dev`                        | 在 `localhost:4321` 启动本地开发服务器      |
| `pnpm build`                      | 构建网站至 `./dist/`                   |
| `pnpm preview`                    | 本地预览已构建的网站                        |
| `pnpm new-post <filename>`        | 创建新文章                             |
| `pnpm astro ...`                  | 执行 `astro add`, `astro check` 等指令 |
| `pnpm astro --help`               | 显示 Astro CLI 帮助                   |
