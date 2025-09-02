/**
 * Application configuration file
 * Centralizes all base URLs, API endpoints, and environment variables
 */

// Environment variables with fallbacks
export const config = {
    // API Base URLs
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
        stocks: {
            quote: '/stocks/quote',
            chart: '/stocks/chart',
            mostActive: '/stocks/most-active',
            news: '/stocks/news',
        },
    },

    // External API Providers
    providers: {
        alphavantage: {
            baseUrl: 'https://www.alphavantage.co/query',
            apiKey: process.env.ALPHAVANTAGE_API_KEY,
        },
        finnhub: {
            baseUrl: 'https://finnhub.io/api/v1',
            apiKey: process.env.FINHUB_API,
        },
        indianstock: {
            baseUrl: 'https://api.indianstock.com',
            apiKey: process.env.INDIAN_STOCK_API,
        },
    },

    // TanStack Query Configuration
    query: {
        defaultStaleTime: 5 * 60 * 1000, // 5 minutes
        defaultCacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },

    // Default refresh intervals for different data types
    refreshIntervals: {
        stockQuotes: 30 * 1000, // 30 seconds
        stockCharts: 60 * 1000, // 1 minute
        mostActive: 2 * 60 * 1000, // 2 minutes
        news: 5 * 60 * 1000, // 5 minutes
    },

    // Pagination defaults
    pagination: {
        defaultPageSize: 10,
        maxPageSize: 100,
    },

    // UI Configuration
    ui: {
        animationDuration: 300,
        toastDuration: 5000,
    },
} as const

// Type definitions for better TypeScript support
export type ApiProvider = keyof typeof config.providers
export type StockEndpoint = keyof typeof config.api.stocks
export type RefreshInterval = keyof typeof config.refreshIntervals

// Helper functions
export const getApiUrl = (endpoint: StockEndpoint): string => {
    return `${config.api.baseUrl}${config.api.stocks[endpoint]}`
}

export const getProviderConfig = (provider: ApiProvider) => {
    return config.providers[provider]
}

export const isProviderConfigured = (provider: ApiProvider): boolean => {
    return Boolean(config.providers[provider].apiKey)
}

// Environment validation
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Check if at least one provider is configured
    const hasConfiguredProvider = Object.keys(config.providers).some(provider =>
        isProviderConfigured(provider as ApiProvider)
    )

    if (!hasConfiguredProvider) {
        errors.push('At least one API provider must be configured')
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}
