import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { config } from '@/lib/config'
import type { StockData, ChartData, NewsData, MostActiveData, ApiResponse } from '@/lib/types'

interface DashboardData {
    stockQuotes: StockData[]
    mostActive: MostActiveData[]
    news: NewsData[]
    chartData: ChartData[]
}

interface UseDashboardDataOptions {
    provider: 'alphavantage' | 'finnhub' | 'indianstock'
    symbols: string[]
    chartSymbol?: string
    chartInterval?: string
    newsTopics?: string
    newsLimit?: number
    enabled?: boolean
}

/**
 * Hook for fetching all dashboard data in parallel
 * This is useful for initial page load or when you need multiple data sources
 */
export function useDashboardData({
    provider,
    symbols,
    chartSymbol,
    chartInterval = '5min',
    newsTopics = 'technology',
    newsLimit = 10,
    enabled = true,
}: UseDashboardDataOptions) {
    return useQuery({
        queryKey: ['dashboard', provider, symbols, chartSymbol, chartInterval, newsTopics, newsLimit],
        queryFn: async (): Promise<DashboardData> => {
            // Fetch all data in parallel
            const [quotesResponse, mostActiveResponse, newsResponse, chartResponse] = await Promise.allSettled([
                // Stock quotes
                fetch('/api/stocks/quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider, symbols }),
                }),

                // Most active stocks
                fetch('/api/stocks/most-active', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider }),
                }),

                // News
                fetch('/api/stocks/news', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider, topics: newsTopics, limit: newsLimit }),
                }),

                // Chart data (only if chartSymbol is provided)
                chartSymbol ? fetch('/api/stocks/chart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ provider, symbol: chartSymbol, interval: chartInterval }),
                }) : Promise.resolve(null),
            ])

            // Process results
            const stockQuotes: StockData[] = quotesResponse.status === 'fulfilled' && quotesResponse.value.ok
                ? (await quotesResponse.value.json()).data
                : []

            const mostActive: MostActiveData[] = mostActiveResponse.status === 'fulfilled' && mostActiveResponse.value.ok
                ? (await mostActiveResponse.value.json()).data
                : []

            const news: NewsData[] = newsResponse.status === 'fulfilled' && newsResponse.value.ok
                ? (await newsResponse.value.json()).data
                : []

            const chartData: ChartData[] = chartResponse.status === 'fulfilled' &&
                chartResponse.value &&
                chartResponse.value.ok
                ? (await chartResponse.value.json()).data
                : []

            return {
                stockQuotes,
                mostActive,
                news,
                chartData,
            }
        },
        enabled: enabled && symbols.length > 0,
        refetchInterval: Math.min(
            config.refreshIntervals.stockQuotes,
            config.refreshIntervals.mostActive,
            config.refreshIntervals.news,
            config.refreshIntervals.stockCharts
        ),
        staleTime: config.query.defaultStaleTime,
    })
}

/**
 * Hook for prefetching dashboard data
 * Useful for prefetching data before navigation or for better UX
 */
export function usePrefetchDashboardData() {
    const queryClient = useQueryClient()

    return {
        prefetchDashboard: async (options: UseDashboardDataOptions) => {
            const queryKey = ['dashboard', options.provider, options.symbols, options.chartSymbol, options.chartInterval, options.newsTopics, options.newsLimit]

            await queryClient.prefetchQuery({
                queryKey,
                queryFn: async () => {
                    // Same logic as useDashboardData
                    const [quotesResponse, mostActiveResponse, newsResponse, chartResponse] = await Promise.allSettled([
                        fetch('/api/stocks/quote', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ provider: options.provider, symbols: options.symbols }),
                        }),
                        fetch('/api/stocks/most-active', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ provider: options.provider }),
                        }),
                        fetch('/api/stocks/news', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ provider: options.provider, topics: options.newsTopics, limit: options.newsLimit }),
                        }),
                        options.chartSymbol ? fetch('/api/stocks/chart', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ provider: options.provider, symbol: options.chartSymbol, interval: options.chartInterval }),
                        }) : Promise.resolve(null),
                    ])

                    const stockQuotes: StockData[] = quotesResponse.status === 'fulfilled' && quotesResponse.value.ok
                        ? (await quotesResponse.value.json()).data
                        : []

                    const mostActive: MostActiveData[] = mostActiveResponse.status === 'fulfilled' && mostActiveResponse.value.ok
                        ? (await mostActiveResponse.value.json()).data
                        : []

                    const news: NewsData[] = newsResponse.status === 'fulfilled' && newsResponse.value.ok
                        ? (await newsResponse.value.json()).data
                        : []

                    const chartData: ChartData[] = chartResponse.status === 'fulfilled' &&
                        chartResponse.value &&
                        chartResponse.value.ok
                        ? (await chartResponse.value.json()).data
                        : []

                    return { stockQuotes, mostActive, news, chartData }
                },
                staleTime: config.query.defaultStaleTime,
            })
        },
    }
}
