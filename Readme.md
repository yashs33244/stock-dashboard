# Finance Dashboard - Groww Assignment

**Developer:** Yash Singh  
**Project:** Groww Assignment - Finance Dashboard  
**Technology Stack:** Next.js 15, React 19, TypeScript, TanStack Query, Tailwind CSS

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Configuration](#configuration)
6. [Data Fetching](#data-fetching)
7. [Components](#components)
8. [API Routes](#api-routes)
9. [Hooks](#hooks)
10. [Installation & Setup](#installation--setup)
11. [Usage](#usage)
12. [Features](#features)
13. [Performance Optimizations](#performance-optimizations)
14. [Error Handling](#error-handling)
15. [Contributing](#contributing)

## 🎯 Project Overview

A modern, responsive finance dashboard built for Groww assignment that provides real-time stock market data visualization with customizable widgets. The application features a drag-and-drop interface, multiple data providers, and comprehensive error handling.

### Key Features
- **Real-time Data**: Live stock quotes, charts, news, and most active stocks
- **Customizable Dashboard**: Drag-and-drop widget management
- **Multiple Data Providers**: Alpha Vantage, Finnhub, and Indian Stock APIs
- **Responsive Design**: Mobile-first approach with dark theme
- **Performance Optimized**: TanStack Query for efficient data fetching and caching

## 🏗️ Architecture

The application follows a modern React architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components    │    │      Hooks      │    │   API Routes    │
│                 │    │                 │    │                 │
│ • Widgets       │◄──►│ • Data Fetching │◄──►│ • Stock APIs    │
│ • Layout        │    │ • State Mgmt    │    │ • Error Handling│
│ • UI Elements   │    │ • Real-time     │    │ • Data Transform│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   TanStack Query│
                    │                 │
                    │ • Caching       │
                    │ • Background Sync│
                    │ • Error Recovery│
                    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **TanStack Query**: Data fetching and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Recharts**: Chart visualization

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Node.js**: Runtime environment

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing

## 📁 Project Structure

```
finance-dashboard/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── stocks/               # Stock-related endpoints
│   │       ├── price-chart/      # Price chart data endpoint
│   │       ├── most-active/      # Most active stocks
│   │       ├── news/             # News data endpoint
│   │       ├── quote/            # Stock quotes endpoint
│   │       ├── technical-indicators/ # Technical indicators endpoint
│   │       ├── fundamental-data/ # Fundamental data endpoint
│   │       ├── company-profile/  # Company profile endpoint
│   │       ├── earnings/         # Earnings calendar endpoint
│   │       └── analyst-data/     # Analyst data endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard page
├── components/                   # React components
│   ├── layout/                   # Layout components
│   │   ├── dashboard-grid.tsx    # Grid layout system
│   │   ├── dashboard-layout.tsx  # Main dashboard layout
│   │   ├── dashboard-sidebar.tsx # Sidebar navigation
│   │   ├── data-management-panel.tsx # Data management
│   │   ├── draggable-widget.tsx  # Draggable widget wrapper
│   │   ├── droppable-dashboard.tsx # Drop zone for widgets
│   │   └── widget-config-panel.tsx # Widget configuration
│   ├── providers/                # Context providers
│   │   └── query-provider.tsx    # TanStack Query provider
│   ├── ui/                       # Reusable UI components
│   │   ├── badge.tsx             # Badge component
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── connection-status.tsx # Connection status indicator
│   │   └── [other-ui-components] # Additional UI components
│   └── widgets/                  # Dashboard widgets
│       ├── price-chart-widget.tsx # Price chart widget
│       ├── finance-card-widget.tsx # Finance card widget
│       ├── most-active-widget.tsx # Most active stocks widget
│       ├── news-widget.tsx       # News widget
│       ├── stock-table-widget.tsx # Stock table widget
│       ├── technical-indicators-widget.tsx # Technical indicators widget
│       ├── company-profile-widget.tsx # Company profile widget
│       ├── earnings-widget.tsx   # Earnings calendar widget
│       └── widget-renderer.tsx   # Widget renderer
├── hooks/                        # Custom React hooks
│   ├── use-connection-status.ts  # Connection status hook
│   ├── use-dashboard-data.ts     # Dashboard data hook
│   ├── use-most-active-stocks.ts # Most active stocks hook

│   ├── use-stock-news.ts         # Stock news hook
│   ├── use-stock-quotes.ts       # Stock quotes hook
│   └── index.ts                  # Hooks barrel export
├── lib/                          # Utility libraries
│   ├── api-explorer.ts           # API exploration utility
│   ├── api-tester.ts             # API testing utility
│   ├── config.ts                 # Configuration management
│   ├── error-sanitizer.ts        # Error message sanitization
│   ├── query-client.ts           # TanStack Query client
│   ├── rate-limit-detector.ts    # Rate limit detection utility
│   ├── store.ts                  # State management
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # Utility functions
├── styles/                       # Global styles
│   └── globals.css               # Global CSS
├── docs.md                       # This documentation
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── tailwind.config.js            # Tailwind CSS configuration
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Keys for different providers
ALPHAVANTAGE_API_KEY=your_alpha_vantage_key
FINHUB_API=your_finnhub_key
INDIAN_STOCK_API=your_indian_stock_key

# Optional: Custom API base URL
NEXT_PUBLIC_API_BASE_URL=/api
```

### Configuration File (`lib/config.ts`)

Centralized configuration for:
- API endpoints and base URLs
- Provider-specific settings
- TanStack Query defaults
- Refresh intervals for different data types
- UI configuration

```typescript
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    stocks: {
      quote: '/stocks/quote',
      priceChart: '/stocks/price-chart',
      mostActive: '/stocks/most-active',
      news: '/stocks/news',
      technicalIndicators: '/stocks/technical-indicators',
      fundamentalData: '/stocks/fundamental-data',
      companyProfile: '/stocks/company-profile',
      earnings: '/stocks/earnings',
      analystData: '/stocks/analyst-data',
    },
  },
  providers: {
    alphavantage: {
      baseUrl: 'https://www.alphavantage.co/query',
      apiKey: process.env.ALPHAVANTAGE_API_KEY,
    },
    // ... other providers
  },
  query: {
    defaultStaleTime: 5 * 60 * 1000, // 5 minutes
    defaultCacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  },
  refreshIntervals: {
    stockQuotes: 30 * 1000, // 30 seconds
    priceCharts: 60 * 1000, // 1 minute
    mostActive: 2 * 60 * 1000, // 2 minutes
    news: 5 * 60 * 1000, // 5 minutes
    technicalIndicators: 5 * 60 * 1000, // 5 minutes
    companyProfile: 10 * 60 * 1000, // 10 minutes
    earnings: 10 * 60 * 1000, // 10 minutes
  },
}
```

## 🔄 Data Fetching

### TanStack Query Implementation

The application uses TanStack Query for efficient data fetching with the following benefits:

- **Intelligent Caching**: Reduces API calls and improves performance
- **Background Refetching**: Keeps data fresh automatically
- **Error Handling**: Built-in retry logic and error states
- **Loading States**: Consistent loading indicators
- **Optimistic Updates**: Better user experience

### Query Client Configuration

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.query.defaultStaleTime,
      gcTime: config.query.defaultCacheTime,
      refetchOnWindowFocus: config.query.refetchOnWindowFocus,
      retry: config.query.retry,
      retryDelay: config.query.retryDelay,
    },
  },
})
```

### Query Keys Factory

Consistent query key management for cache invalidation:

```typescript
export const queryKeys = {
  stocks: {
    all: ['stocks'] as const,
    quotes: (provider: string, symbols: string[]) => 
      ['stocks', 'quotes', provider, symbols] as const,
    priceChart: (provider: string, symbol: string, interval?: string) => 
      ['stocks', 'priceChart', provider, symbol, interval] as const,
    // ... other keys
  },
}
```

## 🧩 Components

### Widget Components

#### StockTableWidget
- **Purpose**: Displays stock data in a table format
- **Features**: Search, pagination, real-time updates
- **Data Source**: `useStockQuotes` hook
- **Refresh Interval**: 30 seconds

#### PriceChartWidget
- **Purpose**: Visualizes stock price data as interactive area charts
- **Features**: OHLC data, multiple time intervals, gradient fills, mock data fallback
- **Data Source**: Alpha Vantage API with mock data fallback
- **Refresh Interval**: 1 minute

#### MostActiveWidget
- **Purpose**: Shows most actively traded stocks
- **Features**: Volume-based sorting, real-time updates
- **Data Source**: `useMostActiveStocks` hook
- **Refresh Interval**: 2 minutes

#### NewsWidget
- **Purpose**: Displays financial news
- **Features**: Topic filtering, sentiment analysis
- **Data Source**: `useStockNews` hook
- **Refresh Interval**: 5 minutes

#### FinanceCardWidget
- **Purpose**: Compact stock information display
- **Features**: Multiple card types (watchlist, gainers, losers)
- **Data Source**: `useStockQuotes` hook
- **Refresh Interval**: 30 seconds

#### TechnicalIndicatorsWidget
- **Purpose**: Displays technical analysis indicators
- **Features**: SMA, EMA, RSI, MACD indicators with customizable parameters
- **Data Source**: Alpha Vantage API
- **Refresh Interval**: 5 minutes

#### CompanyProfileWidget
- **Purpose**: Shows comprehensive company information
- **Features**: Company details, financial metrics, business description
- **Data Source**: Finnhub API
- **Refresh Interval**: 10 minutes

#### EarningsWidget
- **Purpose**: Displays earnings calendar and results
- **Features**: EPS estimates vs actual, revenue data, surprise calculations
- **Data Source**: Finnhub API
- **Refresh Interval**: 10 minutes

### Layout Components

#### DashboardLayout
- **Purpose**: Main dashboard container
- **Features**: Responsive grid, sidebar integration
- **Components**: Header, sidebar, main content area

#### DraggableWidget
- **Purpose**: Makes widgets draggable
- **Features**: Drag-and-drop functionality, resize handles
- **Integration**: @dnd-kit library

#### ConnectionStatus
- **Purpose**: Shows API connection health
- **Features**: Real-time status updates, error indicators
- **Data Source**: `useRealTimeConnectionStatus` hook

## 🛣️ API Routes

### Stock Quote Endpoint (`/api/stocks/quote`)

**Method**: POST  
**Purpose**: Fetch stock quotes for multiple symbols

**Request Body**:
```json
{
  "provider": "alphavantage" | "finnhub" | "indianstock",
  "symbols": ["AAPL", "MSFT", "GOOGL"]
}
```

**Response**:
```json
{
  "data": [
    {
      "symbol": "AAPL",
      "price": 150.25,
      "change": 2.15,
      "changePercent": 1.45,
      "volume": 45000000
    }
  ]
}
```

### Price Chart Data Endpoint (`/api/stocks/price-chart`)

**Method**: GET  
**Purpose**: Fetch historical price data for interactive charts

**Query Parameters**:
```
symbol=AAPL&interval=daily
```

**Response**:
```json
{
  "data": {
    "metaData": {
      "symbol": "AAPL",
      "lastRefreshed": "2024-01-01",
      "interval": "daily",
      "timeZone": "US/Eastern"
    },
    "timeSeries": [
      {
        "date": "2024-01-01",
        "open": 150.00,
        "high": 151.50,
        "low": 149.75,
        "close": 150.25,
        "volume": 1000000
      }
    ]
  },
  "isMockData": false,
  "rateLimitMessage": null
}
```

### Most Active Stocks Endpoint (`/api/stocks/most-active`)

**Method**: POST  
**Purpose**: Fetch most actively traded stocks

**Request Body**:
```json
{
  "provider": "alphavantage"
}
```

### News Endpoint (`/api/stocks/news`)

**Method**: POST  
**Purpose**: Fetch financial news

**Request Body**:
```json
{
  "provider": "alphavantage",
  "topics": "technology",
  "limit": 10
}
```

### Technical Indicators Endpoint (`/api/stocks/technical-indicators`)

**Method**: GET  
**Purpose**: Fetch technical analysis indicators

**Query Parameters**:
```
symbol=AAPL&indicator=SMA&timePeriod=20&interval=daily&seriesType=close
```

### Company Profile Endpoint (`/api/stocks/company-profile`)

**Method**: GET  
**Purpose**: Fetch company profile information

**Query Parameters**:
```
symbol=AAPL
```

### Earnings Calendar Endpoint (`/api/stocks/earnings`)

**Method**: GET  
**Purpose**: Fetch earnings calendar data

**Query Parameters**:
```
from=2024-01-01&to=2024-12-31
```

## 🎣 Hooks

### Data Fetching Hooks

#### useStockQuotes
```typescript
const { data, isLoading, error, refetch } = useStockQuotes({
  provider: 'alphavantage',
  symbols: ['AAPL', 'MSFT'],
  refetchInterval: 30000,
})
```



#### useMostActiveStocks
```typescript
const { data, isLoading, error, refetch } = useMostActiveStocks({
  provider: 'alphavantage',
  refetchInterval: 120000,
})
```

#### useStockNews
```typescript
const { data, isLoading, error, refetch } = useStockNews({
  provider: 'alphavantage',
  topics: 'technology',
  limit: 10,
  refetchInterval: 300000,
})
```

#### useDashboardData
```typescript
const { data } = useDashboardData({
  provider: 'alphavantage',
  symbols: ['AAPL', 'MSFT', 'GOOGL'],
  priceChartSymbol: 'AAPL',
  newsTopics: 'technology',
})
```

### Connection Status Hook

#### useRealTimeConnectionStatus
```typescript
const {
  isConnected,
  isStale,
  timeSinceUpdate,
  lastUpdate,
  error,
} = useRealTimeConnectionStatus()
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Install TanStack Query**
   ```bash
   npm install @tanstack/react-query @tanstack/react-query-devtools
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage

### Basic Usage

1. **Configure API Keys**: Add your API keys to `.env.local`
2. **Add Widgets**: Use the widget configuration panel to add stock widgets
3. **Customize Dashboard**: Drag and drop widgets to arrange your dashboard
4. **Monitor Data**: Watch real-time updates and connection status

### Widget Configuration

Each widget can be configured with:
- **API Provider**: Choose between Alpha Vantage, Finnhub, or Indian Stock
- **Symbols**: Add stock symbols to track
- **Refresh Interval**: Set how often data should update
- **Display Options**: Customize appearance and behavior

### Dashboard Management

- **Add Widgets**: Click the "+" button to add new widgets
- **Remove Widgets**: Click the settings icon and select remove
- **Resize Widgets**: Drag the resize handles on widget corners
- **Reorder Widgets**: Drag widgets to new positions

## ✨ Features

### Core Features
- ✅ **Real-time Data**: Live stock quotes, price charts, and news
- ✅ **Multiple Providers**: Support for 3 different data providers (Alpha Vantage, Finnhub, Indian Stock)
- ✅ **Customizable Dashboard**: Drag-and-drop widget management with 8 widget types
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Dark Theme**: Modern dark UI with glassmorphism effects
- ✅ **Error Handling**: Comprehensive error states and recovery
- ✅ **Loading States**: Smooth loading indicators
- ✅ **Search & Filter**: Search stocks and filter data
- ✅ **Pagination**: Handle large datasets efficiently
- ✅ **Mock Data Fallback**: Graceful fallback to mock data when APIs are rate limited
- ✅ **Rate Limit Detection**: Clear indicators when using demo data

### Advanced Features
- ✅ **Background Sync**: Data updates automatically in background
- ✅ **Intelligent Caching**: Reduces API calls and improves performance
- ✅ **Connection Monitoring**: Real-time connection status
- ✅ **Optimistic Updates**: Better user experience
- ✅ **Retry Logic**: Automatic retry on failed requests
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Accessibility**: ARIA-compliant components
- ✅ **API Key Security**: Sanitized error messages to prevent API key exposure
- ✅ **Technical Analysis**: SMA, EMA, RSI, MACD indicators
- ✅ **Company Intelligence**: Comprehensive company profiles and earnings data
- ✅ **Interactive Charts**: OHLC data with gradient fills and tooltips

## ⚡ Performance Optimizations

### TanStack Query Optimizations
- **Stale Time**: 5 minutes to reduce unnecessary refetches
- **Cache Time**: 10 minutes for better performance
- **Background Refetching**: Keeps data fresh without user interaction
- **Parallel Queries**: Multiple data sources fetched simultaneously
- **Query Deduplication**: Prevents duplicate requests

### React Optimizations
- **Memoization**: Prevents unnecessary re-renders
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Optimized images with Next.js Image component

### Bundle Optimizations
- **Tree Shaking**: Removes unused code
- **Minification**: Compressed JavaScript and CSS
- **Gzip Compression**: Reduced file sizes
- **CDN Ready**: Optimized for content delivery networks

## 🚨 Error Handling

### Error Types
1. **Network Errors**: API connection failures
2. **API Errors**: Invalid responses from data providers
3. **Validation Errors**: Invalid input parameters
4. **Rate Limiting**: API rate limit exceeded
5. **Data Sanitization**: Sensitive information filtering

### Error Recovery
- **Automatic Retry**: Failed requests retry automatically
- **Exponential Backoff**: Increasing delays between retries
- **Fallback Data**: Mock data when APIs are unavailable
- **User Notifications**: Clear error messages for users
- **Error Sanitization**: Prevents API key exposure in error messages
- **Rate Limit Handling**: Graceful degradation with mock data

### Error Boundaries
- **Component Level**: Individual widget error handling
- **Page Level**: Global error boundaries
- **API Level**: Server-side error handling

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow TypeScript and React best practices
2. **Testing**: Write tests for new features
3. **Documentation**: Update documentation for changes
4. **Performance**: Consider performance implications
5. **Accessibility**: Ensure components are accessible

### Pull Request Process
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Performance impact considered
- [ ] Accessibility requirements met

---

**Developed by Yash Singh for Groww Assignment**  
**Last Updated**: January 2024  
**Version**: 1.0.0
