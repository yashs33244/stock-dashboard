/**
 * API Testing Utility
 * Tests all available API endpoints and documents their responses
 */

import { getAllEndpoints, getProviderInfo, type ApiEndpoint } from './api-explorer'

export interface ApiTestResult {
    endpoint: ApiEndpoint
    success: boolean
    responseTime: number
    statusCode?: number
    error?: string
    sampleData?: any
    rateLimitInfo?: {
        remaining: number
        resetTime: number
    }
}

export interface ApiProviderTestResult {
    provider: string
    totalEndpoints: number
    successfulTests: number
    failedTests: number
    averageResponseTime: number
    results: ApiTestResult[]
}

export class ApiTester {
    private results: ApiTestResult[] = []
    private rateLimitTracker: Map<string, { count: number; resetTime: number }> = new Map()

    async testEndpoint(endpoint: ApiEndpoint): Promise<ApiTestResult> {
        const startTime = Date.now()

        try {
            // Check rate limits
            if (this.isRateLimited(endpoint.provider)) {
                throw new Error('Rate limit exceeded for provider')
            }

            // Prepare request parameters
            const params = this.prepareParameters(endpoint)
            const url = this.buildUrl(endpoint, params)

            // Make the request
            const response = await fetch(url, {
                method: endpoint.method,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Finance-Dashboard-API-Tester/1.0'
                }
            })

            const responseTime = Date.now() - startTime
            const responseData = await response.json()

            // Track rate limits
            this.trackRateLimit(endpoint.provider, response.headers)

            const result: ApiTestResult = {
                endpoint,
                success: response.ok,
                responseTime,
                statusCode: response.status,
                sampleData: this.sanitizeResponseData(responseData),
                rateLimitInfo: this.extractRateLimitInfo(response.headers)
            }

            if (!response.ok) {
                result.error = responseData.error || responseData.message || 'Unknown error'
            }

            this.results.push(result)
            return result

        } catch (error) {
            const responseTime = Date.now() - startTime
            const result: ApiTestResult = {
                endpoint,
                success: false,
                responseTime,
                error: error instanceof Error ? error.message : 'Unknown error'
            }

            this.results.push(result)
            return result
        }
    }

    async testProvider(provider: string): Promise<ApiProviderTestResult> {
        const providerInfo = getProviderInfo(provider)
        if (!providerInfo) {
            throw new Error(`Provider ${provider} not found`)
        }

        const endpoints = providerInfo.endpoints
        const results: ApiTestResult[] = []

        console.log(`Testing ${provider} provider with ${endpoints.length} endpoints...`)

        for (const endpoint of endpoints) {
            console.log(`Testing ${endpoint.name}...`)
            const result = await this.testEndpoint(endpoint)
            results.push(result)

            // Add delay to respect rate limits
            await this.delay(this.getDelayForProvider(provider))
        }

        const successfulTests = results.filter(r => r.success).length
        const failedTests = results.filter(r => !r.success).length
        const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length

        return {
            provider,
            totalEndpoints: endpoints.length,
            successfulTests,
            failedTests,
            averageResponseTime,
            results
        }
    }

    async testAllProviders(): Promise<ApiProviderTestResult[]> {
        const providers = ['alphavantage', 'finnhub', 'indianstock']
        const results: ApiProviderTestResult[] = []

        for (const provider of providers) {
            try {
                const result = await this.testProvider(provider)
                results.push(result)
            } catch (error) {
                console.error(`Failed to test provider ${provider}:`, error)
            }
        }

        return results
    }

    private prepareParameters(endpoint: ApiEndpoint): Record<string, any> {
        const params = { ...endpoint.parameters }

        // Replace placeholder API keys with actual keys
        const providerInfo = getProviderInfo(endpoint.provider)
        if (providerInfo) {
            if (endpoint.provider === 'alphavantage') {
                params.apikey = providerInfo.apiKey
            } else if (endpoint.provider === 'finnhub') {
                params.token = providerInfo.apiKey
            } else if (endpoint.provider === 'indianstock') {
                params.api_key = providerInfo.apiKey
            }
        }

        return params
    }

    private buildUrl(endpoint: ApiEndpoint, params: Record<string, any>): string {
        if (endpoint.provider === 'alphavantage') {
            const searchParams = new URLSearchParams()
            Object.entries(params).forEach(([key, value]) => {
                searchParams.append(key, String(value))
            })
            return `${endpoint.url}?${searchParams.toString()}`
        } else {
            // For other providers, build URL with path parameters
            let url = endpoint.url
            Object.entries(params).forEach(([key, value]) => {
                if (key !== 'token' && key !== 'api_key') {
                    url = url.replace(`{${key}}`, String(value))
                }
            })

            const searchParams = new URLSearchParams()
            Object.entries(params).forEach(([key, value]) => {
                if (key === 'token' || key === 'api_key') {
                    searchParams.append(key, String(value))
                }
            })

            return `${url}?${searchParams.toString()}`
        }
    }

    private sanitizeResponseData(data: any): any {
        // Remove sensitive information from response data
        if (typeof data === 'object' && data !== null) {
            const sanitized = { ...data }

            // Remove potential API keys or sensitive data
            delete sanitized.api_key
            delete sanitized.token
            delete sanitized.apikey

            // Limit data size for sample
            if (Array.isArray(sanitized)) {
                return sanitized.slice(0, 3) // Only keep first 3 items
            }

            return sanitized
        }

        return data
    }

    private extractRateLimitInfo(headers: Headers): { remaining: number; resetTime: number } | undefined {
        const remaining = headers.get('X-RateLimit-Remaining')
        const resetTime = headers.get('X-RateLimit-Reset')

        if (remaining && resetTime) {
            return {
                remaining: parseInt(remaining),
                resetTime: parseInt(resetTime)
            }
        }

        return undefined
    }

    private trackRateLimit(provider: string, headers: Headers): void {
        const remaining = headers.get('X-RateLimit-Remaining')
        const resetTime = headers.get('X-RateLimit-Reset')

        if (remaining && resetTime) {
            this.rateLimitTracker.set(provider, {
                count: parseInt(remaining),
                resetTime: parseInt(resetTime)
            })
        }
    }

    private isRateLimited(provider: string): boolean {
        const limit = this.rateLimitTracker.get(provider)
        if (!limit) return false

        return limit.count <= 0 && Date.now() < limit.resetTime
    }

    private getDelayForProvider(provider: string): number {
        const providerInfo = getProviderInfo(provider)
        if (!providerInfo) return 1000

        const { requestsPerMinute } = providerInfo.rateLimits.free
        return Math.ceil(60000 / requestsPerMinute) // Convert to milliseconds
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    getResults(): ApiTestResult[] {
        return this.results
    }

    generateReport(): string {
        const results = this.results
        const totalTests = results.length
        const successfulTests = results.filter(r => r.success).length
        const failedTests = results.filter(r => !r.success).length
        const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length

        let report = `# API Testing Report\n\n`
        report += `## Summary\n`
        report += `- Total Tests: ${totalTests}\n`
        report += `- Successful: ${successfulTests}\n`
        report += `- Failed: ${failedTests}\n`
        report += `- Success Rate: ${((successfulTests / totalTests) * 100).toFixed(2)}%\n`
        report += `- Average Response Time: ${averageResponseTime.toFixed(2)}ms\n\n`

        // Group by provider
        const byProvider = results.reduce((acc, result) => {
            if (!acc[result.endpoint.provider]) {
                acc[result.endpoint.provider] = []
            }
            acc[result.endpoint.provider].push(result)
            return acc
        }, {} as Record<string, ApiTestResult[]>)

        Object.entries(byProvider).forEach(([provider, providerResults]) => {
            report += `## ${provider.toUpperCase()}\n\n`

            providerResults.forEach(result => {
                const status = result.success ? '✅' : '❌'
                report += `### ${status} ${result.endpoint.name}\n`
                report += `- **Description**: ${result.endpoint.description}\n`
                report += `- **Response Time**: ${result.responseTime}ms\n`
                report += `- **Status Code**: ${result.statusCode || 'N/A'}\n`

                if (result.error) {
                    report += `- **Error**: ${result.error}\n`
                }

                if (result.rateLimitInfo) {
                    report += `- **Rate Limit**: ${result.rateLimitInfo.remaining} remaining\n`
                }

                report += `\n`
            })
        })

        return report
    }
}

// Utility function to run API tests
export async function runApiTests(): Promise<ApiProviderTestResult[]> {
    const tester = new ApiTester()
    return await tester.testAllProviders()
}

// Utility function to test specific provider
export async function testProvider(provider: string): Promise<ApiProviderTestResult> {
    const tester = new ApiTester()
    return await tester.testProvider(provider)
}

// Utility function to test specific endpoint
export async function testEndpoint(endpoint: ApiEndpoint): Promise<ApiTestResult> {
    const tester = new ApiTester()
    return await tester.testEndpoint(endpoint)
}
