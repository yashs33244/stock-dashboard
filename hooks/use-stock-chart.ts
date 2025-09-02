import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { config } from '@/lib/config'
import type { ChartData, ApiResponse, QueryOptions } from '@/lib/types'

interface UseStockChartOptions extends QueryOptions {
    provider: 'alphavantage' | 'finnhub' | 'indianstock'
    symbol: string
    interval?: string
}

/**
 * Hook for fetching stock chart data
 */
export function useStockChart({
    provider,
    symbol,
    interval = '5min',
    enabled = true,
    refetchInterval = config.refreshIntervals.stockCharts,
    ...queryOptions
}: UseStockChartOptions) {
    return useQuery({
        queryKey: queryKeys.stocks.chart(provider, symbol, interval),
        queryFn: async (): Promise<ChartData[]> => {
            const response = await fetch('/api/stocks/chart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider,
                    symbol,
                    interval,
                }),
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch chart data: ${response.statusText}`)
            }

            const result: ApiResponse<ChartData[]> = await response.json()

            if (result.error) {
                throw new Error(result.error)
            }

            return result.data
        },
        enabled: enabled && Boolean(symbol),
        refetchInterval,
        ...queryOptions,
    })
}
