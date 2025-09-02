import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { config } from '@/lib/config'
import type { NewsData, ApiResponse, QueryOptions } from '@/lib/types'

interface UseStockNewsOptions extends QueryOptions {
    provider: 'alphavantage' | 'finnhub' | 'indianstock'
    topics?: string
    limit?: number
}

/**
 * Hook for fetching stock news data
 */
export function useStockNews({
    provider,
    topics = 'technology',
    limit = 10,
    enabled = true,
    refetchInterval = config.refreshIntervals.news,
    ...queryOptions
}: UseStockNewsOptions) {
    return useQuery({
        queryKey: queryKeys.stocks.news(provider, topics, limit),
        queryFn: async (): Promise<{ data: NewsData[], isMockData: boolean, rateLimitMessage?: string }> => {
            const response = await fetch('/api/stocks/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider,
                    topics,
                    limit,
                }),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch stock news: ${response.statusText}`)
            }

            const result: ApiResponse<NewsData[]> = await response.json()

            if (result.error) {
                throw new Error(result.error)
            }

            return {
                data: result.data,
                isMockData: result.isMockData || false,
                rateLimitMessage: result.rateLimitMessage
            }
        },
        enabled,
        refetchInterval,
        ...queryOptions,
    })
}
