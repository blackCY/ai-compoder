# 前端通用规范

// TODO 还是得琢磨一下这里该怎么搞

## 客户端组件

对于客户端组件，用 Suspense 流式传输并设置一个 fallback，fallback 默认都是用 /components/skeleton.tsx

## React 组件内函数写法

- 业务功能函数使用 on 开头，如 onSendMessage
- 副作用函数使用 handle 开头，如 handleEmit