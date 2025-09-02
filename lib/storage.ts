import type { Widget } from "./store"

export interface DashboardConfig {
  version: string
  timestamp: number
  widgets: Widget[]
  theme: "light" | "dark"
  metadata?: {
    name?: string
    description?: string
    author?: string
  }
}

export class DashboardStorage {
  private static readonly STORAGE_KEY = "finance-dashboard-storage"
  private static readonly VERSION = "1.0.0"

  // Export dashboard configuration
  static exportConfig(widgets: Widget[], theme: "light" | "dark", metadata?: DashboardConfig["metadata"]): string {
    const config: DashboardConfig = {
      version: this.VERSION,
      timestamp: Date.now(),
      widgets,
      theme,
      metadata,
    }

    return JSON.stringify(config, null, 2)
  }

  // Import dashboard configuration
  static importConfig(configJson: string): DashboardConfig {
    try {
      const config = JSON.parse(configJson) as DashboardConfig

      // Validate required fields
      if (!config.version || !config.widgets || !Array.isArray(config.widgets)) {
        throw new Error("Invalid configuration format")
      }

      // Validate widget structure
      for (const widget of config.widgets) {
        if (!widget.id || !widget.type || !widget.title || !widget.config) {
          throw new Error("Invalid widget configuration")
        }
      }

      return config
    } catch (error) {
      throw new Error(`Failed to parse configuration: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Download configuration as file
  static downloadConfig(widgets: Widget[], theme: "light" | "dark", filename?: string): void {
    const config = this.exportConfig(widgets, theme, {
      name: filename || "My Dashboard",
      description: "Finance dashboard configuration",
      author: "Dashboard User",
    })

    const blob = new Blob([config], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `${filename || "dashboard-config"}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  // Upload configuration from file
  static uploadConfig(): Promise<DashboardConfig> {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".json"

      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (!file) {
          reject(new Error("No file selected"))
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const config = this.importConfig(e.target?.result as string)
            resolve(config)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsText(file)
      }

      input.click()
    })
  }

  // Clear all stored data
  static clearStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    sessionStorage.removeItem(this.STORAGE_KEY)
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      const used = data ? new Blob([data]).size : 0
      const available = 5 * 1024 * 1024 // Approximate 5MB localStorage limit
      const percentage = (used / available) * 100

      return { used, available, percentage }
    } catch {
      return { used: 0, available: 0, percentage: 0 }
    }
  }

  // Create backup of current state
  static createBackup(widgets: Widget[], theme: "light" | "dark"): void {
    const backupKey = `${this.STORAGE_KEY}-backup-${Date.now()}`
    const config = this.exportConfig(widgets, theme, {
      name: "Automatic Backup",
      description: "Automatically created backup",
    })

    try {
      localStorage.setItem(backupKey, config)
      this.cleanupOldBackups()
    } catch (error) {
      console.warn("Failed to create backup:", error)
    }
  }

  // Clean up old backups (keep only last 5)
  private static cleanupOldBackups(): void {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter((key) => key.startsWith(`${this.STORAGE_KEY}-backup-`))
        .sort()

      if (backupKeys.length > 5) {
        const keysToRemove = backupKeys.slice(0, backupKeys.length - 5)
        keysToRemove.forEach((key) => localStorage.removeItem(key))
      }
    } catch (error) {
      console.warn("Failed to cleanup old backups:", error)
    }
  }

  // Get available backups
  static getBackups(): Array<{ key: string; timestamp: number; config: DashboardConfig }> {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter((key) => key.startsWith(`${this.STORAGE_KEY}-backup-`))
        .sort()
        .reverse()

      return backupKeys
        .map((key) => {
          try {
            const configJson = localStorage.getItem(key)
            if (!configJson) return null

            const config = JSON.parse(configJson) as DashboardConfig
            return { key, timestamp: config.timestamp, config }
          } catch {
            return null
          }
        })
        .filter((backup): backup is NonNullable<typeof backup> => backup !== null)
    } catch {
      return []
    }
  }

  // Restore from backup
  static restoreBackup(backupKey: string): DashboardConfig {
    const configJson = localStorage.getItem(backupKey)
    if (!configJson) {
      throw new Error("Backup not found")
    }

    return this.importConfig(configJson)
  }
}
