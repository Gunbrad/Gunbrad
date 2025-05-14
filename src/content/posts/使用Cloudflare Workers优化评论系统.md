---
title: 使用Cloudflare Workers优化评论系统
published: 2025-05-14
description: ''
tags: [记录]
category: '博客'
draft: false
---

## 一： 问题背景

我用Vercel + MongoDB Atlas + Twikoo 搭建了博客的评论系统，今天测试时发现，只有常挂梯子时才能正常加载出评论功能。这是因为Vercel的服务在中国大陆无法正常访问，导致评论系统无法加载。

## 二： 解决方案

使用Cloudflare的Workers功能搭建反向代理，实现智能分流。这样无论用户是否使用VPN，都能正常加载评论系统。（cloudflare真香）

## 三： 实施步骤

### 3.1 创建Cloudflare Worker

1. 注册/登录Cloudflare账号
2. 进入`Workers & Pages`界面
3. 点击`创建` → `从Hello World!开始`
4. 编写Worker代码：

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  // 填写Twikoo API的Vercel地址
  const apiUrl = 'https://xxxx';

  try {
    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, apiUrl);

    console.log(`代理请求: ${request.method} ${targetUrl.toString()}`);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('Origin', apiUrl);
    requestHeaders.set('Referer', apiUrl);

    const newRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
      redirect: 'follow'
    });

    const response = await fetch(newRequest);

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    responseHeaders.set('Access-Control-Max-Age', '86400');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    console.error(`代理请求失败: ${error.message}`);
    return new Response(`代理请求失败: ${error.message}`, { status: 500 });
  }
}

function handleOptions(request) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  });

  return new Response(null, {
    status: 204,
    headers
  });
}
```

5. 保存并部署Worker

### 3.2 配置自定义域名

1. 在Cloudflare DNS管理中，添加子域名记录：
   
   - 类型: `CNAME`，必填
   - 名称: `twikoo`，随便填
   - 目标: `<your-worker-name>.<your-username>.workers.dev`，最终会得到类似于这样结构的url

2. 在Worker设置的`域和路由`选项卡中添加自定义域名和路由，以我的为例`twikoo.gunbrad.xyz`

### 3.3 修改博客项目配置

把本地项目中原配置的vercel链接全换成刚才自定义的域名即可

## 
