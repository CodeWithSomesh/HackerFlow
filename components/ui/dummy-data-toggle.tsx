'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface DummyDataToggleProps {
  onToggle: (useDummy: boolean) => void
  defaultValue?: boolean
}

export function DummyDataToggle({ onToggle, defaultValue = true }: DummyDataToggleProps) {
  const [useDummyData, setUseDummyData] = useState(defaultValue)

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('useDummyData')
    if (stored !== null) {
      const value = stored === 'true'
      setUseDummyData(value)
      onToggle(value)
    }
  }, [])

  const handleToggle = (checked: boolean) => {
    setUseDummyData(checked)
    localStorage.setItem('useDummyData', checked.toString())
    onToggle(checked)
    // Reload the page to apply changes
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 border-2 border-gray-700 rounded-lg">
      <Switch
        id="dummy-data-toggle"
        checked={useDummyData}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-purple-600"
      />
      <Label
        htmlFor="dummy-data-toggle"
        className="text-sm font-mono text-gray-300 cursor-pointer"
      >
        Use Dummy Data (Development Mode)
      </Label>
    </div>
  )
}
