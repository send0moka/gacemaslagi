"use client"

import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Shield, Globe } from "lucide-react"

interface Settings {
  notifications: {
    newConsultation: boolean
    newFeedback: boolean
    consultationReminder: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
  }
  system: {
    maintenanceMode: boolean
    systemEmail: string
    maxConsultationsPerDay: number
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      newConsultation: true,
      newFeedback: true,
      consultationReminder: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30
    },
    system: {
      maintenanceMode: false,
      systemEmail: "admin@gacemaslagi.com",
      maxConsultationsPerDay: 5
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          id: 1, // Single row for all settings
          data: settings 
        })

      if (error) throw error
      toast.success("Settings saved successfully")
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="bg-muted p-1 gap-1">
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2 px-4 py-2 rounded-md transition-all"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2 px-4 py-2 rounded-md transition-all"
          >
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="system" 
            className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex items-center gap-2 px-4 py-2 rounded-md transition-all"
          >
            <Globe className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="newConsultation">
                  New Consultation Requests
                  <p className="text-sm text-gray-500">Get notified when new consultation requests arrive</p>
                </Label>
                <Switch
                  id="newConsultation"
                  checked={settings.notifications.newConsultation}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, newConsultation: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="newFeedback">
                  New Feedback
                  <p className="text-sm text-gray-500">Get notified when users submit feedback</p>
                </Label>
                <Switch
                  id="newFeedback"
                  checked={settings.notifications.newFeedback}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, newFeedback: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="consultationReminder">
                  Consultation Reminders
                  <p className="text-sm text-gray-500">Send reminders before scheduled consultations</p>
                </Label>
                <Switch
                  id="consultationReminder"
                  checked={settings.notifications.consultationReminder}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, consultationReminder: checked }
                    }))
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorAuth">
                  Two-Factor Authentication
                  <p className="text-sm text-gray-500">Require 2FA for admin access</p>
                </Label>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, twoFactorAuth: checked }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">
                  Session Timeout (minutes)
                  <p className="text-sm text-gray-500">Auto logout after inactivity</p>
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                    }))
                  }
                  className="max-w-[200px]"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenanceMode">
                  Maintenance Mode
                  <p className="text-sm text-gray-500">Temporarily disable public access</p>
                </Label>
                <Switch
                  id="maintenanceMode"
                  checked={settings.system.maintenanceMode}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({
                      ...prev,
                      system: { ...prev.system, maintenanceMode: checked }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemEmail">
                  System Email
                  <p className="text-sm text-gray-500">Email for system notifications</p>
                </Label>
                <Input
                  id="systemEmail"
                  type="email"
                  value={settings.system.systemEmail}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      system: { ...prev.system, systemEmail: e.target.value }
                    }))
                  }
                  className="max-w-[300px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxConsultations">
                  Max Consultations Per Day
                  <p className="text-sm text-gray-500">Limit daily consultations per expert</p>
                </Label>
                <Input
                  id="maxConsultations"
                  type="number"
                  value={settings.system.maxConsultationsPerDay}
                  onChange={(e) => 
                    setSettings(prev => ({
                      ...prev,
                      system: { ...prev.system, maxConsultationsPerDay: parseInt(e.target.value) }
                    }))
                  }
                  className="max-w-[200px]"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
