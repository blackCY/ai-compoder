"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

/**
 * TanStack Query Provider
 * 为应用提供 TanStack Query 客户端
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // @ts-expect-error - suspense is supported at runtime in v5
            suspense: true, // 启用 Suspense 模式，配合 loading.tsx 使用
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, _error) => {
              // 对于网络错误，重试最多2次
              if (failureCount < 2) return true
              return false
            },
          },
          mutations: {
            retry: false, // mutations 默认不重试
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
