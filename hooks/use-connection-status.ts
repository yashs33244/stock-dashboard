import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import type { ConnectionStatus } from '@/lib/types'

/**
 * Hook for monitoring connection status
 * This hook provides a simple way to track the overall health of API connections
 */
export function useConnectionStatus() {
    return useQuery({
        queryKey: queryKeys.connection.status,
        queryFn: async (): Promise<ConnectionStatus> => {
            // For now, we'll return a simple connected status
            // In a real implementation, this could ping various endpoints
            // or check the health of different services
            return {
                isConnected: true,
                lastUpdate: Date.now(),
            }
        },
        refetchInterval: 30000, // Check every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
        retry: 1,
    })
}

/**
 * Hook for getting connection status with real-time updates
 * This provides a more detailed connection status that updates frequently
 */
export function useRealTimeConnectionStatus() {
    const { data: status, ...rest } = useConnectionStatus()

    // Calculate time since last update
    const timeSinceUpdate = status ? Date.now() - status.lastUpdate : 0

    // Determine if connection is stale (no updates for over 1 minute)
    const isStale = timeSinceUpdate > 60000

    // Determine connection state
    const connectionState = {
        isConnected: status?.isConnected ?? false,
        isStale,
        timeSinceUpdate,
        lastUpdate: status?.lastUpdate ?? 0,
        error: status?.error,
    }

    return {
        ...connectionState,
        ...rest,
    }
}
