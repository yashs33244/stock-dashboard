import { QueryClient } from '@tanstack/react-query'
import { config } from './config'

/**
 * TanStack Query client configuration
 * Centralized query client with default options
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: config.query.defaultStaleTime,
            gcTime: config.query.defaultCacheTime, // Previously cacheTime
            refetchOnWindowFocus: config.query.refetchOnWindowFocus,
            retry: config.query.retry,
            retryDelay: config.query.retryDelay,
        },
        mutations: {
            retry: 1,
        },
    },
})

/**
 * Query keys factory for consistent key management
 */
export const queryKeys = {
    // Stock data queries
    stocks: {
        all: ['stocks'] as const,
        quotes: (provider: string, symbols: string[]) =>
            ['stocks', 'quotes', provider, symbols] as const,
        chart: (provider: string, symbol: string, interval?: string) =>
            ['stocks', 'chart', provider, symbol, interval] as const,
        mostActive: (provider: string) =>
            ['stocks', 'mostActive', provider] as const,
        news: (provider: string, topics?: string, limit?: number) =>
            ['stocks', 'news', provider, topics, limit] as const,
    },

    // Connection status
    connection: {
        status: ['connection', 'status'] as const,
    },
} as const

/**
 * Prefetch utilities for common queries
 */
export const prefetchQueries = {
    stockQuotes: async (provider: string, symbols: string[]) => {
        return queryClient.prefetchQuery({
            queryKey: queryKeys.stocks.quotes(provider, symbols),
            queryFn: async () => {
                const response = await fetch('/api/stocks/quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider, symbols }),
                })
                if (!response.ok) throw new Error('Failed to fetch quotes')
                return response.json()
            },
        })
    },

    mostActive: async (provider: string) => {
        return queryClient.prefetchQuery({
            queryKey: queryKeys.stocks.mostActive(provider),
            queryFn: async () => {
                const response = await fetch('/api/stocks/most-active', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider }),
                })
                if (!response.ok) throw new Error('Failed to fetch most active stocks')
                return response.json()
            },
        })
    },
}
