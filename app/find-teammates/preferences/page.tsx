'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Settings,
  MapPin,
  Code,
  Trophy,
  Github,
  Users,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { showCustomToast } from '@/components/toast-notification'
import {
  getMatchPreferences,
  updateMatchPreferences,
  MatchPreferences
} from '@/lib/actions/matchmaking-actions'

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<Partial<MatchPreferences>>({
    looking_for_team: true,
    available_for_online: true,
    available_for_offline: true,
    available_for_hybrid: true,
    location_preference: 'any',
    preferred_team_size: 4,
    min_hackathons_participated: 0,
    min_hackathons_won: 0,
    min_github_contributions: 0,
    prefer_active_github: false,
    only_show_verified: false,
    hide_profile: false
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    setLoading(true)
    const result = await getMatchPreferences()

    if (result.success && result.data) {
      setPreferences(result.data)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)

    const result = await updateMatchPreferences(preferences)

    if (result.success) {
      showCustomToast('success', 'Preferences saved successfully!')
    } else {
      showCustomToast('error', result.error || 'Failed to save preferences')
    }

    setSaving(false)
  }

  const updateField = (field: keyof MatchPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono font-bold">Loading preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black mt-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-500 to-yellow-400 border-y-4 border-pink-400 shadow-2xl">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/find-teammates">
                <button className="p-2 rounded-lg bg-gray-900/80 backdrop-blur border-2 border-gray-700 hover:border-teal-400 transition-all">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
              </Link>

              <div>
                <h1 className="text-4xl font-blackops text-white drop-shadow-lg">
                  MATCHMAKING PREFERENCES
                </h1>
                <p className="text-lg text-white/90 font-mono mt-1">
                  Customize how we find your perfect teammate
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-mono font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Form */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Looking For Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border-2 border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-teal-500/20 border-2 border-teal-400/50">
              <Users className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h2 className="text-2xl font-blackops text-white uppercase tracking-wide">
                Looking For
              </h2>
              <p className="text-sm text-gray-400 font-mono">
                What are you looking for?
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 rounded-xl bg-black/50 border-2 border-gray-700 cursor-pointer hover:border-teal-400 transition-all">
              <input
                type="checkbox"
                checked={preferences.looking_for_team}
                onChange={(e) => updateField('looking_for_team', e.target.checked)}
                className="w-5 h-5 rounded text-teal-500 focus:ring-teal-500 bg-gray-800 border-gray-600"
              />
              <div>
                <div className="font-mono font-bold text-white">
                  I'm looking for a team
                </div>
                <div className="text-sm text-gray-400 font-mono">
                  Show me potential teammates
                </div>
              </div>
            </label>

            <div>
              <label className="block text-sm font-mono font-bold text-gray-300 mb-2">
                Preferred Team Size
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={preferences.preferred_team_size}
                onChange={(e) => updateField('preferred_team_size', parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-black border-2 border-gray-700 text-white font-mono focus:outline-none focus:border-teal-400 transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Availability Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border-2 border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-cyan-500/20 border-2 border-cyan-400/50">
              <Settings className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-blackops text-white uppercase tracking-wide">
                Availability
              </h2>
              <p className="text-sm text-gray-400 font-mono">
                What types of hackathons are you available for?
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 rounded-xl bg-black/50 border-2 border-gray-700 cursor-pointer hover:border-cyan-400 transition-all">
              <input
                type="checkbox"
                checked={preferences.available_for_online}
                onChange={(e) => updateField('available_for_online', e.target.checked)}
                className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-500 bg-gray-800 border-gray-600"
              />
              <div>
                <div className="font-mono font-bold text-white">Online Hackathons</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-black/50 border-2 border-gray-700 cursor-pointer hover:border-cyan-400 transition-all">
              <input
                type="checkbox"
                checked={preferences.available_for_offline}
                onChange={(e) => updateField('available_for_offline', e.target.checked)}
                className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-500 bg-gray-800 border-gray-600"
              />
              <div>
                <div className="font-mono font-bold text-white">Offline Hackathons</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl bg-black/50 border-2 border-gray-700 cursor-pointer hover:border-cyan-400 transition-all">
              <input
                type="checkbox"
                checked={preferences.available_for_hybrid}
                onChange={(e) => updateField('available_for_hybrid', e.target.checked)}
                className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-500 bg-gray-800 border-gray-600"
              />
              <div>
                <div className="font-mono font-bold text-white">Hybrid Hackathons</div>
              </div>
            </label>
          </div>
        </motion.div>

        {/* Location Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border-2 border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-green-500/20 border-2 border-green-400/50">
              <MapPin className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-blackops text-white uppercase tracking-wide">
                Location Preferences
              </h2>
              <p className="text-sm text-gray-400 font-mono">
                Where should your teammates be located?
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-mono font-bold text-gray-300 mb-2">
              Location Preference
            </label>
            <select
              value={preferences.location_preference}
              onChange={(e) => updateField('location_preference', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black border-2 border-gray-700 text-white font-mono focus:outline-none focus:border-green-400 transition-all"
            >
              <option value="any">Anywhere</option>
              <option value="same_city">Same City Only</option>
              <option value="same_state">Same State/Region Only</option>
              <option value="same_country">Same Country Only</option>
            </select>
          </div>
        </motion.div>

        {/* Hackathon Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border-2 border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-yellow-500/20 border-2 border-yellow-400/50">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-blackops text-white uppercase tracking-wide">
                Hackathon Experience
              </h2>
              <p className="text-sm text-gray-400 font-mono">
                Minimum experience level you're looking for
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono font-bold text-gray-300 mb-2">
                Minimum Hackathons Participated ({preferences.min_hackathons_participated})
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={preferences.min_hackathons_participated}
                onChange={(e) => updateField('min_hackathons_participated', parseInt(e.target.value))}
                className="w-full accent-yellow-400"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono">
                <span>0 (Any)</span>
                <span>50+</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-mono font-bold text-gray-300 mb-2">
                Minimum Hackathons Won ({preferences.min_hackathons_won})
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={preferences.min_hackathons_won}
                onChange={(e) => updateField('min_hackathons_won', parseInt(e.target.value))}
                className="w-full accent-yellow-400"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono">
                <span>0 (Any)</span>
                <span>20+</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* GitHub Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border-2 border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gray-500/20 border-2 border-gray-400/50">
              <Github className="w-6 h-6 text-gray-300" />
            </div>
            <div>
              <h2 className="text-2xl font-blackops text-white uppercase tracking-wide">
                GitHub Activity
              </h2>
              <p className="text-sm text-gray-400 font-mono">
                Preferences for GitHub activity level
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 rounded-xl bg-black/50 border-2 border-gray-700 cursor-pointer hover:border-gray-400 transition-all">
              <input
                type="checkbox"
                checked={preferences.prefer_active_github}
                onChange={(e) => updateField('prefer_active_github', e.target.checked)}
                className="w-5 h-5 rounded text-gray-500 focus:ring-gray-500 bg-gray-800 border-gray-600"
              />
              <div>
                <div className="font-mono font-bold text-white">
                  Prefer Active GitHub Users
                </div>
                <div className="text-sm text-gray-400 font-mono">
                  Prioritize users with active GitHub contributions
                </div>
              </div>
            </label>

            <div>
              <label className="block text-sm font-mono font-bold text-gray-300 mb-2">
                Minimum GitHub Contributions ({preferences.min_github_contributions})
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={preferences.min_github_contributions}
                onChange={(e) => updateField('min_github_contributions', parseInt(e.target.value))}
                className="w-full accent-gray-400"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1 font-mono">
                <span>0 (Any)</span>
                <span>1000+</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Other Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border-2 border-gray-700"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-pink-500/20 border-2 border-pink-400/50">
              <Settings className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-2xl font-blackops text-white uppercase tracking-wide">
                Other Preferences
              </h2>
              <p className="text-sm text-gray-400 font-mono">
                Additional matchmaking settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 rounded-xl bg-black/50 border-2 border-gray-700 cursor-pointer hover:border-pink-400 transition-all">
              <input
                type="checkbox"
                checked={preferences.hide_profile}
                onChange={(e) => updateField('hide_profile', e.target.checked)}
                className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500 bg-gray-800 border-gray-600"
              />
              <div>
                <div className="font-mono font-bold text-white">
                  Hide My Profile
                </div>
                <div className="text-sm text-gray-400 font-mono">
                  Don't show my profile to others
                </div>
              </div>
            </label>
          </div>
        </motion.div>

        {/* Save Button (Bottom) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center pt-4"
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-mono font-bold hover:shadow-xl hover:shadow-pink-500/50 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Preferences...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save All Preferences
              </span>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
