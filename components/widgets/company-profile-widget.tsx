"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Building2, Globe, Phone, Calendar, TrendingUp, TrendingDown, Settings, RefreshCw } from "lucide-react"
import { sanitizeErrorForDisplay } from "@/lib/error-sanitizer"
import type { Widget } from "@/lib/store"

interface CompanyProfileWidgetProps {
  widget: Widget
  onUpdate: (data: any) => void
  onConfigure: () => void
}

interface CompanyProfileData {
  country: string
  currency: string
  exchange: string
  ipo: string
  marketCapitalization: number
  name: string
  phone: string
  shareOutstanding: number
  ticker: string
  weburl: string
  logo: string
  finnhubIndustry: string
}

interface CompanyProfileResponse {
  data: CompanyProfileData
  isMockData: boolean
  rateLimitMessage?: string
}

export function CompanyProfileWidget({ widget, onUpdate, onConfigure }: CompanyProfileWidgetProps) {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [profileData, setProfileData] = useState<CompanyProfileResponse | null>(null)

  const fetchCompanyProfile = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        symbol: selectedSymbol
      })

      const response = await fetch(`/api/stocks/company-profile?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch company profile')
      }

      setProfileData(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const forceRefresh = () => {
    fetchCompanyProfile()
  }

  useEffect(() => {
    fetchCompanyProfile()
  }, [selectedSymbol])

  const isMockData = useMemo(() => profileData?.isMockData || false, [profileData?.isMockData])
  const rateLimitMessage = useMemo(() => profileData?.rateLimitMessage, [profileData?.rateLimitMessage])

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return `$${marketCap.toLocaleString()}`
  }

  const formatShares = (shares: number) => {
    if (shares >= 1e9) return `${(shares / 1e9).toFixed(2)}B`
    if (shares >= 1e6) return `${(shares / 1e6).toFixed(2)}M`
    return shares.toLocaleString()
  }

  const getIndustryColor = (industry: string) => {
    const colors: Record<string, string> = {
      'Technology': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Healthcare': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Financial Services': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Consumer Discretionary': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Automotive': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Energy': 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    return colors[industry] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  return (
    <Card className="h-full bg-slate-900/50 border-slate-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Company Profile</span>
            {isMockData && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                Demo Data
              </span>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={forceRefresh}
              disabled={loading}
              className="text-slate-300 hover:text-slate-100 hover:bg-slate-700/50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onConfigure}
              className="text-slate-300 hover:text-slate-100 hover:bg-slate-700/50"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Symbol Input */}
        <div>
          <Label htmlFor="symbol" className="text-xs text-slate-400">Company Symbol</Label>
          <div className="flex space-x-2">
            <Input
              id="symbol"
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
              className="bg-slate-800/50 border-slate-600 text-slate-100"
              placeholder="AAPL"
            />
            <Button
              onClick={fetchCompanyProfile}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
            {sanitizeErrorForDisplay(error)}
          </div>
        )}

        {loading && !profileData ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading company profile...
          </div>
        ) : profileData?.data ? (
          <div className="space-y-4">
            {/* Company Header */}
            <div className="flex items-start space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              {profileData.data.logo && (
                <img
                  src={profileData.data.logo}
                  alt={`${profileData.data.name} logo`}
                  className="w-16 h-16 rounded-lg object-contain bg-white/10 p-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-100">{profileData.data.name}</h3>
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    {profileData.data.ticker}
                  </Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getIndustryColor(profileData.data.finnhubIndustry)}`}
                >
                  {profileData.data.finnhubIndustry}
                </Badge>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-slate-400">Market Cap</span>
                </div>
                <p className="text-lg font-semibold text-slate-100">
                  {formatMarketCap(profileData.data.marketCapitalization)}
                </p>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-slate-400">Shares Outstanding</span>
                </div>
                <p className="text-lg font-semibold text-slate-100">
                  {formatShares(profileData.data.shareOutstanding)}
                </p>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Globe className="h-4 w-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400">Website</p>
                  <a
                    href={profileData.data.weburl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>{profileData.data.weburl}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Phone className="h-4 w-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="text-slate-100">{profileData.data.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Calendar className="h-4 w-4 text-slate-400" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400">IPO Date</p>
                  <p className="text-slate-100">
                    {new Date(profileData.data.ipo).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <p className="text-sm text-slate-400">Exchange</p>
                  <p className="text-slate-100 font-semibold">{profileData.data.exchange}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <p className="text-sm text-slate-400">Country</p>
                  <p className="text-slate-100 font-semibold">{profileData.data.country}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-slate-400">
            <p>No company profile data available</p>
          </div>
        )}

        {isMockData && rateLimitMessage && (
          <div className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded border border-yellow-500/30">
            {rateLimitMessage}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
