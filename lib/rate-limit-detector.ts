/**
 * Rate limit detection utility for API responses
 */

export interface RateLimitInfo {
  isRateLimited: boolean
  retryAfter?: number
  message?: string
}

export function detectRateLimit(response: Response, data: any): RateLimitInfo {
  // Check HTTP status codes that typically indicate rate limiting
  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after')
    return {
      isRateLimited: true,
      retryAfter: retryAfter ? parseInt(retryAfter) : undefined,
      message: 'Rate limit exceeded'
    }
  }

  // Check for common rate limit error messages in response data
  if (data && typeof data === 'object') {
    const errorMessage = data['Error Message'] || data['Note'] || data['Information'] || data['error']
    
    if (errorMessage && typeof errorMessage === 'string') {
      const lowerMessage = errorMessage.toLowerCase()
      
      // Alpha Vantage specific rate limit messages
      if (lowerMessage.includes('api call frequency') || 
          lowerMessage.includes('rate limit') ||
          lowerMessage.includes('premium') ||
          lowerMessage.includes('api key') && lowerMessage.includes('call') ||
          lowerMessage.includes('thank you for using alpha vantage')) {
        return {
          isRateLimited: true,
          message: errorMessage
        }
      }
      
      // Finnhub specific rate limit messages
      if (lowerMessage.includes('api limit') ||
          lowerMessage.includes('quota') ||
          lowerMessage.includes('exceeded')) {
        return {
          isRateLimited: true,
          message: errorMessage
        }
      }
    }
  }

  return { isRateLimited: false }
}

export function getMockDataFlag(): { isMockData: boolean; reason?: string } {
  // This could be enhanced to check localStorage or other persistence
  // For now, we'll rely on the API responses to determine this
  return { isMockData: false }
}
