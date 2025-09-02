/**
 * Centralized exports for all custom hooks
 */

// Data fetching hooks
export { useStockQuotes } from './use-stock-quotes'
export { useStockChart } from './use-stock-chart'
export { useMostActiveStocks } from './use-most-active-stocks'
export { useStockNews } from './use-stock-news'
export { useDashboardData, usePrefetchDashboardData } from './use-dashboard-data'

// Connection status hooks
export { useConnectionStatus, useRealTimeConnectionStatus } from './use-connection-status'

// UI hooks (existing)
export { useIsMobile } from './use-mobile'
export { useToast } from './use-toast'

// Re-export TanStack Query hooks for convenience
export {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
    useSuspenseQuery
} from '@tanstack/react-query'
