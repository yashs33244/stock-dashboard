import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { config } from '@/lib/config'
import type { StockData, ApiResponse, QueryOptions } from '@/lib/types'

interface UseStockQuotesOptions extends QueryOptions {
    provider: 'alphavantage' | 'finnhub' | 'indianstock'
    symbols: string[]
}

/**
 * Hook for fetching stock quotes data
 */
export function useStockQuotes({
    provider,
    symbols,
    enabled = true,
    refetchInterval = config.refreshIntervals.stockQuotes,
    ...queryOptions
}: UseStockQuotesOptions) {
    return useQuery({
        queryKey: queryKeys.stocks.quotes(provider, symbols),
        queryFn: async (): Promise<StockData[]> => {
            const response = await fetch('/api/stocks/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider,
                    symbols,
                }),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch stock quotes: ${response.statusText}`)
            }

            const result: ApiResponse<StockData[]> = await response.json()

            if (result.error) {
                throw new Error(result.error)
            }

            return result.data
        },
        enabled: enabled && symbols.length > 0,
        refetchInterval,
        ...queryOptions,
    })
}
