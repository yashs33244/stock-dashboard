/**
 * Error sanitization utility to prevent sensitive information exposure
 */

export function sanitizeErrorMessage(error: Error | string): string {
  const errorMessage = typeof error === 'string' ? error : error.message
  
  // List of sensitive patterns to remove or replace
  const sensitivePatterns = [
    // API key patterns
    /api[_-]?key[_-]?not[_-]?configured/gi,
    /api[_-]?key[_-]?missing/gi,
    /invalid[_-]?api[_-]?key/gi,
    /api[_-]?key[_-]?required/gi,
    
    // Authentication patterns
    /unauthorized/gi,
    /forbidden/gi,
    /authentication[_-]?failed/gi,
    /invalid[_-]?credentials/gi,
    
    // Rate limiting patterns that might expose internal details
    /rate[_-]?limit[_-]?exceeded/gi,
    /quota[_-]?exceeded/gi,
    /too[_-]?many[_-]?requests/gi,
  ]
  
  // Replace sensitive patterns with generic messages
  let sanitizedMessage = errorMessage
  
  sensitivePatterns.forEach(pattern => {
    if (pattern.test(sanitizedMessage)) {
      sanitizedMessage = sanitizedMessage.replace(pattern, 'Service temporarily unavailable')
    }
  })
  
  // Generic error messages for common sensitive scenarios
  const genericMessages: Record<string, string> = {
    'API key not configured': 'Service configuration error',
    'API key missing': 'Service configuration error',
    'Invalid API key': 'Authentication error',
    'API key required': 'Service configuration error',
    'Unauthorized': 'Authentication error',
    'Forbidden': 'Access denied',
    'Authentication failed': 'Authentication error',
    'Invalid credentials': 'Authentication error',
    'Rate limit exceeded': 'Service temporarily unavailable',
    'Quota exceeded': 'Service temporarily unavailable',
    'Too many requests': 'Service temporarily unavailable',
  }
  
  // Replace known sensitive messages
  Object.entries(genericMessages).forEach(([sensitive, generic]) => {
    if (sanitizedMessage.toLowerCase().includes(sensitive.toLowerCase())) {
      sanitizedMessage = generic
    }
  })
  
  // If the message is still too revealing, provide a generic fallback
  if (sanitizedMessage.length > 100 || sanitizedMessage.includes('key') || sanitizedMessage.includes('token')) {
    return 'An error occurred while fetching data'
  }
  
  return sanitizedMessage
}

export function sanitizeErrorForDisplay(error: unknown): string {
  if (error instanceof Error) {
    return sanitizeErrorMessage(error)
  }
  
  if (typeof error === 'string') {
    return sanitizeErrorMessage(error)
  }
  
  return 'An unexpected error occurred'
}
