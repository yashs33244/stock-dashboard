/**
 * Type definitions for the finance dashboard
 */

// Stock data types
export interface StockData {
    symbol: string
    price: number
    change: number
    changePercent: number
    volume: number
    high?: number
    low?: number
    open?: number
    close?: number
}

// Chart data types
export interface ChartData {
    timestamp: string
    open: number
    high: number
    low: number
    close: number
    volume: number
}

// News data types
export interface NewsData {
    title: string
    summary: string
    url: string
    source: string
    published: string
    sentiment?: string
    relevanceScore?: number
    image?: string
}

// Most active stocks type
export interface MostActiveData {
    symbol: string
    price: number
    change: number
    changePercent: number
    volume: number
}

// API response types
export interface ApiResponse<T> {
    data: T
    error?: string
    isMockData?: boolean
    rateLimitMessage?: string
}

// Widget configuration types
export interface WidgetConfig {
    apiProvider: 'alphavantage' | 'finnhub' | 'indianstock'
    symbols?: string[]
    symbol?: string
    interval?: string
    topics?: string
    limit?: number
    refreshInterval?: number
}

// Widget types
export interface Widget {
    id: string
    type: 'table' | 'chart' | 'news' | 'mostActive' | 'financeCard'
    title: string
    config: WidgetConfig
    position: { x: number; y: number }
    size: { width: number; height: number }
}

// Connection status type
export interface ConnectionStatus {
    isConnected: boolean
    lastUpdate: number
    error?: string
}

// Query options type
export interface QueryOptions {
    enabled?: boolean
    refetchInterval?: number
    staleTime?: number
    gcTime?: number
}
