/**
 * QueryClient 工具函数
 * 支持服务端和客户端使用
 */

import { QueryClient } from '@tanstack/react-query'

/**
 * 获取服务端 QueryClient 实例
 * 每次请求创建新实例，避免跨请求污染
 */
export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: (failureCount, _error) => {
          if (failureCount < 2) return true
          return false
        },
      },
      mutations: {
        retry: false,
      },
    },
  })
}
