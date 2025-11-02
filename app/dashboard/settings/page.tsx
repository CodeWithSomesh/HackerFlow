'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { User, Bell, Shield, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setProfile(profile)
    }

    setLoading(false)
  }

  async function handleSaveProfile() {
    setSaving(true)
    // Add save logic here
    toast.success('Settings saved successfully')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 mb-2">
          SETTINGS
        </h1>
        <p className="text-gray-400 font-mono">
          Manage your account preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <User className="h-5 w-5 text-teal-400" />
            Profile Settings
          </CardTitle>
          <CardDescription className="font-mono">
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300 font-mono">Full Name</Label>
            <Input
              value={profile?.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300 font-mono">Email</Label>
            <Input
              value={profile?.email || ''}
              disabled
              className="bg-gray-800 border-gray-700 text-gray-500"
            />
            <p className="text-xs text-gray-500 font-mono">Email cannot be changed</p>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <Bell className="h-5 w-5 text-cyan-400" />
            Notification Preferences
          </CardTitle>
          <CardDescription className="font-mono">
            Choose how you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="font-semibold text-white">Email Notifications</p>
              <p className="text-sm text-gray-400 font-mono">Receive updates via email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="font-semibold text-white">Push Notifications</p>
              <p className="text-sm text-gray-400 font-mono">Receive push notifications</p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            Privacy & Security
          </CardTitle>
          <CardDescription className="font-mono">
            Manage your privacy settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div>
              <p className="font-semibold text-white">Public Profile</p>
              <p className="text-sm text-gray-400 font-mono">Allow others to view your profile</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-gradient-to-br from-red-900/20 to-black border-2 border-red-500/50">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-400" />
            Danger Zone
          </CardTitle>
          <CardDescription className="font-mono text-red-400">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="font-mono font-bold">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
