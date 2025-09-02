"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDashboardStore } from "@/lib/store"
import { DashboardStorage } from "@/lib/storage"
import { Download, Upload, Trash2, RotateCcw, AlertTriangle, CheckCircle, Database } from "lucide-react"

export function DataManagementPanel() {
  const { widgets, theme, updateWidget, removeWidget, addWidget, setTheme } = useDashboardStore()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [backups, setBackups] = useState(DashboardStorage.getBackups())

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleExport = () => {
    try {
      DashboardStorage.downloadConfig(widgets, theme, "my-finance-dashboard")
      showMessage("success", "Dashboard configuration exported successfully!")
    } catch (error) {
      showMessage("error", `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleImport = async () => {
    setIsLoading(true)
    try {
      const config = await DashboardStorage.uploadConfig()

      // Create backup before importing
      DashboardStorage.createBackup(widgets, theme)

      // Clear existing widgets and import new ones
      widgets.forEach((widget) => removeWidget(widget.id))

      // Import new widgets
      config.widgets.forEach((widget) => {
        addWidget({
          type: widget.type,
          title: widget.title,
          position: widget.position,
          size: widget.size,
          config: widget.config,
        })
      })

      // Import theme
      if (config.theme) {
        setTheme(config.theme)
      }

      setBackups(DashboardStorage.getBackups())
      showMessage("success", `Imported ${config.widgets.length} widgets successfully!`)
    } catch (error) {
      showMessage("error", `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBackup = () => {
    try {
      DashboardStorage.createBackup(widgets, theme)
      setBackups(DashboardStorage.getBackups())
      showMessage("success", "Backup created successfully!")
    } catch (error) {
      showMessage("error", `Backup failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleRestoreBackup = (backupKey: string) => {
    try {
      const config = DashboardStorage.restoreBackup(backupKey)

      // Clear existing widgets
      widgets.forEach((widget) => removeWidget(widget.id))

      // Restore widgets
      config.widgets.forEach((widget) => {
        addWidget({
          type: widget.type,
          title: widget.title,
          position: widget.position,
          size: widget.size,
          config: widget.config,
        })
      })

      // Restore theme
      if (config.theme) {
        setTheme(config.theme)
      }

      showMessage("success", "Dashboard restored from backup!")
    } catch (error) {
      showMessage("error", `Restore failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      try {
        // Create final backup before clearing
        DashboardStorage.createBackup(widgets, theme)

        // Clear widgets
        widgets.forEach((widget) => removeWidget(widget.id))

        // Clear storage
        DashboardStorage.clearStorage()

        setBackups(DashboardStorage.getBackups())
        showMessage("success", "All data cleared successfully!")
      } catch (error) {
        showMessage("error", `Clear failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }
  }

  const storageInfo = DashboardStorage.getStorageInfo()

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {message && (
        <Alert className={message.type === "error" ? "border-destructive" : "border-chart-3"}>
          {message.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Import & Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleExport} className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={handleImport} disabled={isLoading} className="w-full bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Export your dashboard configuration to share or backup. Import configurations from JSON files.
          </p>
        </CardContent>
      </Card>

      {/* Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Backups ({backups.length})</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCreateBackup}>
              Create Backup
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {backups.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {backups.map((backup) => (
                <div key={backup.key} className="flex items-center justify-between p-2 bg-muted/20 rounded-md">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{backup.config.metadata?.name || "Dashboard Backup"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(backup.timestamp).toLocaleString()}</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {backup.config.widgets.length} widgets
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRestoreBackup(backup.key)}>
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No backups available</p>
          )}
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Storage Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used:</span>
              <span>{(storageInfo.used / 1024).toFixed(1)} KB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{storageInfo.percentage.toFixed(1)}% used</span>
              <span>~{Math.floor(storageInfo.available / 1024)} KB available</span>
            </div>
          </div>

          <Separator />

          <Button variant="destructive" size="sm" onClick={handleClearAll} className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
