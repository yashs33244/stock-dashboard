import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { config } from '@/lib/config'
import type { MostActiveData, ApiResponse, QueryOptions } from '@/lib/types'

interface UseMostActiveStocksOptions extends QueryOptions {
    provider: 'alphavantage' | 'finnhub' | 'indianstock'
}

/**
 * Hook for fetching most active stocks data
 */
export function useMostActiveStocks({
    provider,
    enabled = true,
    refetchInterval = config.refreshIntervals.mostActive,
    ...queryOptions
}: UseMostActiveStocksOptions) {
    return useQuery({
        queryKey: queryKeys.stocks.mostActive(provider),
        queryFn: async (): Promise<{ data: MostActiveData[], isMockData: boolean, rateLimitMessage?: string }> => {
            const response = await fetch('/api/stocks/most-active', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider,
                }),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch most active stocks: ${response.statusText}`)
            }

            const result: ApiResponse<MostActiveData[]> = await response.json()

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
