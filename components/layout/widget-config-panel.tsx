"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useDashboardStore } from "@/lib/store"
import { X, Plus } from "lucide-react"

export function WidgetConfigPanel() {
  const { selectedWidget, widgets, updateWidget, selectWidget, isConfigPanelOpen, toggleConfigPanel } =
    useDashboardStore()

  const widget = widgets.find((w) => w.id === selectedWidget)
  const [localConfig, setLocalConfig] = useState(widget?.config || {})
  const [localTitle, setLocalTitle] = useState(widget?.title || "")
  const [newSymbol, setNewSymbol] = useState("")

  useEffect(() => {
    if (widget) {
      setLocalConfig(widget.config)
      setLocalTitle(widget.title)
    }
  }, [widget])

  if (!isConfigPanelOpen || !widget) {
    return null
  }

  const handleSave = () => {
    updateWidget(selectedWidget!, {
      title: localTitle,
      config: localConfig,
    })
    toggleConfigPanel()
  }

  const handleAddSymbol = () => {
    if (newSymbol.trim()) {
      const currentSymbols = localConfig.symbols || []
      setLocalConfig({
        ...localConfig,
        symbols: [...currentSymbols, newSymbol.trim().toUpperCase()],
      })
      setNewSymbol("")
    }
  }

  const handleRemoveSymbol = (symbolToRemove: string) => {
    const currentSymbols = localConfig.symbols || []
    setLocalConfig({
      ...localConfig,
      symbols: currentSymbols.filter((symbol) => symbol !== symbolToRemove),
    })
  }

  const handleConfigChange = (key: string, value: any) => {
    setLocalConfig({
      ...localConfig,
      [key]: value,
    })
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-lg z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold font-[family-name:var(--font-source-sans)]">Widget Settings</h2>
          <Button variant="ghost" size="sm" onClick={toggleConfigPanel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="widget-title">Widget Title</Label>
                <Input
                  id="widget-title"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  placeholder="Enter widget title"
                />
              </div>

              <div>
                <Label htmlFor="api-provider">API Provider</Label>
                <Select
                  value={localConfig.apiProvider}
                  onValueChange={(value) => handleConfigChange("apiProvider", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alphavantage">Alpha Vantage</SelectItem>
                    <SelectItem value="finnhub">Finnhub</SelectItem>
                    <SelectItem value="indianstock">Indian Stock API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                <Select
                  value={String(localConfig.refreshInterval || 30000)}
                  onValueChange={(value) => handleConfigChange("refreshInterval", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10000">10 seconds</SelectItem>
                    <SelectItem value="30000">30 seconds</SelectItem>
                    <SelectItem value="60000">1 minute</SelectItem>
                    <SelectItem value="300000">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Symbols Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Stock Symbols</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter symbol (e.g., AAPL)"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSymbol()}
                />
                <Button size="sm" onClick={handleAddSymbol}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(localConfig.symbols || []).map((symbol) => (
                  <Badge key={symbol} variant="secondary" className="flex items-center space-x-1">
                    <span>{symbol}</span>
                    <button onClick={() => handleRemoveSymbol(symbol)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {(!localConfig.symbols || localConfig.symbols.length === 0) && (
                <p className="text-sm text-muted-foreground">No symbols configured</p>
              )}
            </CardContent>
          </Card>

          {/* Widget-specific Settings */}
          {widget.type === "chart" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Chart Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="chart-type">Chart Type</Label>
                  <Select
                    value={localConfig.chartType || "line"}
                    onValueChange={(value) => handleConfigChange("chartType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="chart-interval">Time Interval</Label>
                  <Select
                    value={localConfig.interval || "5min"}
                    onValueChange={(value) => handleConfigChange("interval", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1min">1 minute</SelectItem>
                      <SelectItem value="5min">5 minutes</SelectItem>
                      <SelectItem value="15min">15 minutes</SelectItem>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="60min">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {widget.type === "card" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Card Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="card-type">Card Type</Label>
                  <Select
                    value={localConfig.cardType || "watchlist"}
                    onValueChange={(value) => handleConfigChange("cardType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="watchlist">Watchlist</SelectItem>
                      <SelectItem value="gainers">Top Gainers</SelectItem>
                      <SelectItem value="losers">Top Losers</SelectItem>
                      <SelectItem value="volume">High Volume</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={toggleConfigPanel} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
