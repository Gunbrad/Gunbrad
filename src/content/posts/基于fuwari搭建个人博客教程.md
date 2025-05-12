---
title: 基于fuwari搭建个人博客教程
published: 2025-05-12
description: ''
image: ''
tags: [教程,记录]
category: '教程'
draft: false 
lang: ''
---

# 从零开始搭建个人博客完整指南

本指南将详细介绍如何使用Fuwari项目搭建个人博客，并通过GitHub Pages托管和Cloudflare代理加速，使其在国内能够稳定访问。

## 目录

- [准备工作](#%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C)
- [下载并配置Fuwari项目](#%E4%B8%8B%E8%BD%BD%E5%B9%B6%E9%85%8D%E7%BD%AEfuwari%E9%A1%B9%E7%9B%AE)
- [创建并发布内容](#%E5%88%9B%E5%BB%BA%E5%B9%B6%E5%8F%91%E5%B8%83%E5%86%85%E5%AE%B9)
- [部署到GitHub Pages](#%E9%83%A8%E7%BD%B2%E5%88%B0github-pages)
- [使用Cloudflare代理加速](#%E4%BD%BF%E7%94%A8cloudflare%E4%BB%A3%E7%90%86%E5%8A%A0%E9%80%9F)
- [网站备案指南](#%E7%BD%91%E7%AB%99%E5%A4%87%E6%A1%88%E6%8C%87%E5%8D%97)
- [维护与更新](#%E7%BB%B4%E6%8A%A4%E4%B8%8E%E6%9B%B4%E6%96%B0)
- [常见问题解答](#%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98%E8%A7%A3%E7%AD%94)

## 准备工作

### 1. 安装必要工具

1. **安装Git**
   
   - 访问 [Git官网](https://git-scm.com/)下载并安装
   
   - 安装后打开终端或命令提示符，验证安装：
     
     ```bash
     git --version
     ```

2. **安装Node.js**
   
   - 访问 [Node.js官网](https://nodejs.org/)下载并安装LTS版本
   
   - 验证安装：
     
     ```bash
     node --version
     npm --version
     ```

3. **安装pnpm**
   
   - 在终端或命令提示符中执行（以管理员模式运行）：
     
     ```bash
     npm install -g pnpm
     ```
   
   - 验证安装：
     
     ```bash
     pnpm --version
     ```

4. **注册GitHub账号**
   
   - 访问 [GitHub](https://github.com/)注册账号（如果还没有）

### 2. 准备域名（可选）

- 如果你想使用自定义域名而不是默认的`<用户名>.github.io`，需要购买一个域名
- 推荐的域名注册商：[Namecheap](https://www.namecheap.com/)、[GoDaddy](https://www.godaddy.com/)、[阿里云](https://wanwang.aliyun.com/)等

## 下载并配置Fuwari项目

### 1. 使用模板创建仓库

1. 访问 [Fuwari GitHub仓库](https://github.com/saicaca/fuwari)
2. 点击右上角的 "Use this template" 按钮，选择 "Create a new repository"
3. 填写仓库信息：
   - Repository name: 建议使用 `<用户名>.github.io`（这样可以直接作为GitHub Pages的默认网址）
   - 选择 "Public"（GitHub Pages需要公开仓库，除非你是付费用户）
4. 点击 "Create repository from template"

### 2. 克隆仓库到本地

1. 在你的新仓库页面，点击 "Code" 按钮

2. 复制HTTPS或SSH地址

3. 打开终端或命令提示符，切换到你想保存项目的目录

4. 执行克隆命令：
   
   ```bash
   git clone https://github.com/你的用户名/你的仓库名.git
   ```

5. 进入项目目录：
   
   ```bash
   cd 你的仓库名
   ```

### 3. 安装依赖

在项目目录下执行：

```bash
pnpm install
pnpm add sharp
```

这将安装所有必要的依赖，包括图片处理库sharp。

### 4. 配置博客信息

1. 打开 `src/config.ts` 文件
2. 该文件现在包含四个主要的配置部分：站点配置、导航栏配置、个人资料配置和许可证配置。

#### 站点基本配置 (siteConfig)

```typescript
export const siteConfig: SiteConfig = {
  title: "你的博客标题",        // 博客主标题
  subtitle: "你的博客副标题",   // 博客副标题
  lang: "zh_CN",              // 语言设置：'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
  themeColor: {
    hue: 250,                 // 主题色调值(0-360)，如红色:0, 青色:200, 蓝色:250, 粉色:345
    fixed: false,             // 设为true则访客无法修改主题颜色
  },
  banner: {
    enable: true,             // 是否启用横幅图片
    src: "assets/images/banner.jpg", // 横幅图片路径，相对于/src目录，如以'/'开头则相对于/public目录
    position: "center",       // 图片位置，支持'top'、'center'、'bottom'
    credit: {
      enable: false,          // 是否显示图片来源信息
      text: "",               // 来源文本
      url: "",                // 来源链接
    },
  },
  toc: {
    enable: true,             // 是否在文章右侧显示目录
    depth: 2,                 // 目录最大深度(1-3)
  },
  favicon: [],                // 网站图标配置，留空使用默认图标
};
```

#### 导航栏配置 (navBarConfig)

```typescript
export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,          // 首页链接(预设)
    LinkPreset.Archive,       // 归档链接(预设)
    LinkPreset.About,         // 关于页面链接(预设)
    {
      name: "GitHub",         // 自定义链接名称
      url: "https://github.com/你的用户名", // 链接URL，内部链接不要包含基础路径
      external: true,         // true表示外部链接，将在新标签页打开并显示外部链接图标
    },
    // 可添加更多自定义链接
  ],
};
```

#### 个人资料配置 (profileConfig)

```typescript
export const profileConfig: ProfileConfig = {
  avatar: "assets/images/avatar.jpg", // 头像路径，相对于/src目录，如以'/'开头则相对于/public目录
  name: "你的名字",            // 显示的名字
  bio: "关于你的简介",         // 个人简介
  links: [
    {
      name: "Twitter",        // 社交媒体名称
      icon: "fa6-brands:twitter", // 图标代码，可访问https://icones.js.org/查找
      // 如需使用新的图标集，需安装对应的图标包：`pnpm add @iconify-json/<图标集名称>`
      url: "https://twitter.com/你的用户名",
    },
    {
      name: "GitHub",
      icon: "fa6-brands:github",
      url: "https://github.com/你的用户名",
    },
    // 可添加更多社交媒体链接
  ],
};
```

#### 许可证配置 (licenseConfig)

```typescript
export const licenseConfig: LicenseConfig = {
  enable: true,               // 是否在文章底部显示许可证信息
  name: "CC BY-NC-SA 4.0",    // 许可证名称
  url: "https://creativecommons.org/licenses/by-nc-sa/4.0/", // 许可证链接
};
```

3. 保存配置文件后可以运行`pnpm dev`查看效果

### 5. 替换资源文件

1. 头像图片：
   
   - 推荐将头像放在 `src/assets/images/` 目录下
   - 也可以放在 `public` 目录下，此时路径需以 `/` 开头
   - 在`profileConfig`中更新头像路径

2. 横幅图片：
   
   - 推荐将横幅图片放在 `src/assets/images/` 目录下
   - 在`siteConfig.banner`中更新路径

3. 自定义网站图标：
   
   - 替换 `public/favicon` 目录下的文件
   - 或在`siteConfig.favicon`数组中配置新的图标

## 创建并发布内容

### 1. 创建新文章

1. 使用内置命令创建文章：
   
   ```bash
   pnpm new-post 文章文件名
   ```
   
   这将在 `src/content/posts/` 目录下创建一个新的Markdown文件。

2. 编辑文章的frontmatter信息：
   
   ```markdown
   ---
   title: 文章标题
   published: 2023-10-15
   description: 文章描述
   image: ./cover.jpg  # 可选的封面图片
   tags: [标签1, 标签2]
   category: 分类名称
   draft: false  # 设为true表示草稿，不会发布
   lang: zh  # 文章语言，如果和网站默认语言不同才需要设置
   ---
   
   这里写文章内容...
   ```

3. 如果需要添加封面图片，将图片放在同一目录下，并在frontmatter中引用。

### 2. 本地预览

1. 运行开发服务器：
   
   ```bash
   pnpm dev
   ```

2. 在浏览器中访问 `http://localhost:4321` 预览效果

3. 进行必要的调整，直到满意为止

## 部署到GitHub Pages

### 1. 配置GitHub Pages

首先，需要修改 `astro.config.mjs` 文件：

1. 打开 `astro.config.mjs`

2. 更新配置，添加site和base选项：
   
   ```javascript
   export default defineConfig({
   site: 'https://你的用户名.github.io',
   // 如果不是部署在根目录，需要设置base路径
   // base: '/仓库名', // 如果仓库名是 用户名.github.io，则不需要此行
   // ... 其他配置 ...
   });
   ```

### 2. 创建GitHub Actions工作流

GitHub Actions可以自动化部署过程：

1. 在项目根目录创建 `.github/workflows` 目录（如果不存在）

2. 在该目录下创建 `deploy.yml` 文件，内容如下：
   
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
   push:
     branches: [main]
   workflow_dispatch:
   
   permissions:
   contents: read
   pages: write
   id-token: write
   
   jobs:
   build:
     runs-on: ubuntu-latest
     steps:
       - name: Checkout
         uses: actions/checkout@v3
       - name: Setup Node
         uses: actions/setup-node@v3
         with:
           node-version: '18'
           cache: 'npm'
       - name: Setup PNPM
         uses: pnpm/action-setup@v2
         with:
           version: 7
       - name: Install dependencies
         run: pnpm install && pnpm add sharp
       - name: Build
         run: pnpm build
       - name: Upload Pages Artifact
         uses: actions/upload-pages-artifact@v1
         with:
           path: "./dist"
   
   deploy:
     needs: build
     runs-on: ubuntu-latest
     environment:
       name: github-pages
       url: ${{ steps.deployment.outputs.page_url }}
     steps:
       - name: Deploy to GitHub Pages
         id: deployment
         uses: actions/deploy-pages@v1
   ```

### 3. 启用GitHub Pages

1. 进入GitHub上的仓库页面
2. 点击 "Settings" > "Pages"
3. 在 "Source" 部分，选择 "GitHub Actions"
4. 保存设置

### 4. 推送代码并触发部署

1. 将更改添加到暂存区：
   
   ```bash
   git add .
   ```

2. 提交更改：
   
   ```bash
   git commit -m "Initial setup and configuration"
   ```

3. 推送到GitHub：
   
   ```bash
   git push origin main
   ```

4. 在GitHub仓库页面的 "Actions" 标签页中可以查看部署进度

5. 部署完成后，你的网站将在 `https://你的用户名.github.io` 可访问

### 5. 配置自定义域名（可选）

如果你有自己的域名：

1. 在项目的 `public` 目录下创建 `CNAME` 文件，内容为你的自定义域名：
   
   ```
   yourdomain.com
   ```

2. 提交并推送这个变更

3. 在你的域名注册商控制面板中，添加DNS记录指向GitHub Pages：
   
   - 创建A记录：将`@`指向`185.199.108.153`、`185.199.109.153`、`185.199.110.153`和`185.199.111.153`
   - 或创建CNAME记录：将`www`指向`你的用户名.github.io`

## 使用Cloudflare代理加速

### 1. 注册Cloudflare账号

1. 访问 [Cloudflare官网](https://www.cloudflare.com/)
2. 点击 "Sign Up"，完成注册流程

### 2. 添加网站到Cloudflare

1. 登录Cloudflare账号
2. 点击 "Add a Site"
3. 输入你的域名（例如：`yourdomain.com`）
4. 选择免费计划
5. Cloudflare会自动扫描你的DNS记录

### 3. 更新域名服务器

1. Cloudflare会提供两个名称服务器（NS）记录
2. 登录你的域名注册商账号
3. 找到名称服务器设置，将其更改为Cloudflare提供的名称服务器
4. 更改可能需要24-48小时生效

### 4. 配置DNS记录

1. 在Cloudflare控制面板点击 "DNS" 选项卡
2. 添加以下A记录（如果使用GitHub Pages）：
   - 类型: A
   - 名称: @
   - IPv4地址: 185.199.108.153
   - 代理状态: 已代理（橙色云朵）
3. 对185.199.109.153、185.199.110.153和185.199.111.153重复此步骤
4. 添加CNAME记录：
   - 类型: CNAME
   - 名称: www
   - 目标: 你的用户名.github.io
   - 代理状态: 已代理（橙色云朵）

### 5. 配置Page Rules（可选）

1. 点击 "Page Rules" 选项卡
2. 点击 "Create Page Rule"
3. 可以创建的规则示例：
   - 设置始终使用HTTPS：
     - URL模式: `http://*yourdomain.com/*`
     - 设置: "Always Use HTTPS"
   - 设置页面缓存：
     - URL模式: `*yourdomain.com/*`
     - 设置: "Cache Level" > "Cache Everything"

### 6. 启用SSL/TLS

1. 点击 "SSL/TLS" 选项卡
2. 将SSL/TLS加密模式设置为 "Full" 或 "Full (Strict)"
3. 在 "Edge Certificates" 部分确保 "Always Use HTTPS" 已启用

### 7. 优化设置

1. 在 "Speed" 选项卡下:
   - 启用 "Auto Minify" 选项（HTML、CSS、JavaScript）
   - 启用 "Brotli" 压缩
   - 启用 "Rocket Loader"（如果网站兼容）
2. 在 "Caching" 选项卡下:
   - 调整浏览器缓存TTL设置
   - 配置缓存级别

## 网站备案指南

> 注意：以下是中国大陆网站备案流程，如果你的服务器不在中国大陆或不面向中国大陆用户，可以跳过此步骤。使用Cloudflare代理的情况下，通常可以不用备案也能在国内访问。

### 1. 了解备案要求

在中国大陆，网站备案是指向工信部申请ICP备案。如果使用中国大陆服务器托管网站，必须完成备案。

### 2. 备案途径

有两种主要的备案途径：

1. **通过服务器提供商备案**（推荐）：
   
   - 阿里云、腾讯云等云服务提供商提供免费的备案服务
   - 流程相对简单，会有专人指导

2. **直接向工信部申请**：
   
   - 流程较复杂
   - 需要自行准备所有材料

### 3. 备案所需材料

1. **个人备案**：
   
   - 身份证正反面扫描件
   - 手持身份证照片
   - 域名证书（从域名注册商获取）
   - 备案授权码（从服务器提供商获取）
   - 网站真实性核验单（可在备案系统生成）

2. **企业备案**：
   
   - 营业执照副本扫描件
   - 法定代表人身份证正反面扫描件
   - 域名证书
   - 备案授权码
   - 网站负责人身份证正反面扫描件
   - 网站真实性核验单

### 4. 备案流程

1. **准备工作**：
   
   - 确认域名已完成实名认证
   - 确保域名有效期大于3个月
   - 准备好所有备案材料
   - 设计好网站首页和内容（审核时需要）

2. **提交备案申请**：
   
   - 登录服务商备案系统
   - 填写备案信息
   - 上传备案材料
   - 进行网站内容和负责人审核

3. **短信核验**：
   
   - 收到短信验证码
   - 在规定时间内完成验证

4. **管局审核**：
   
   - 提交后工信部会进行审核
   - 审核时间通常为5-20个工作日

5. **获取备案号**：
   
   - 审核通过后获得ICP备案号
   - 需要在网站底部显示备案号和链接

### 5. 备案后注意事项

1. 网站内容必须与备案信息一致
2. 网站底部必须显示ICP备案号和工信部链接
3. 定期查看备案信息是否需要更新
4. 如网站内容有重大变更，需要及时更新备案信息

## 维护与更新

### 1. 日常维护

1. **内容更新**：
   
   ```bash
   # 创建新文章
   pnpm new-post 新文章名
   
   # 本地预览
   pnpm dev
   
   # 提交变更
   git add .
   git commit -m "Add new post: 文章标题"
   git push origin main
   ```

2. **依赖更新**：
   
   ```bash
   # 检查过时的依赖
   pnpm outdated
   
   # 更新依赖
   pnpm update
   ```

### 2. 主题更新

1. 将原始Fuwari仓库添加为远程仓库：
   
   ```bash
   git remote add upstream https://github.com/saicaca/fuwari.git
   ```

2. 获取上游更新：
   
   ```bash
   git fetch upstream
   ```

3. 合并更新（可能需要解决冲突）：
   
   ```bash
   git merge upstream/main
   ```

4. 推送更新：
   
   ```bash
   git push origin main
   ```

## 常见问题解答

### 1. 部署问题

**Q: GitHub Actions部署失败怎么办？**

A: 检查workflow文件是否正确，确保所有依赖都已正确安装。查看Actions日志以获取详细错误信息。

**Q: 网站部署成功但无法访问怎么办？**

A: 检查域名DNS设置是否正确，Cloudflare代理是否配置好。可能需要等待DNS传播（最多48小时）。

### 2. Cloudflare问题

**Q: Cloudflare显示"DNS记录活跃但不是通过Cloudflare代理"？**

A: 确保DNS记录的状态是橙色云朵（已代理），而不是灰色云朵（仅DNS）。

**Q: Cloudflare代理后网站加载变慢？**

A: 尝试关闭一些高级功能，如Rocket Loader或某些Page Rules。测试不同的缓存设置。

### 3. 内容管理问题

**Q: 如何添加图片到文章中？**

A: 将图片放在与Markdown文件相同的目录下，然后使用相对路径引用：`![描述](./图片名.jpg)`

**Q: 如何创建新页面（非博客文章）？**

A: 在`src/pages/`目录下创建新的`.astro`或`.md`文件。

**Q: 如何修改导航菜单？**

A: 编辑`src/config.ts`文件中的`navBarConfig`对象的`links`数组。~~~~~~~~
