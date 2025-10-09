"use client"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabel?: string
}

export function ProgressIndicator({ currentStep, totalSteps, stepLabel }: ProgressIndicatorProps) {
  const progress = Math.max(0, Math.min(100, ((currentStep-1) / totalSteps) * 100))

  return (
    <div className="w-full mx-auto bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 p-4 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-200 font-mono font-bold">
          {stepLabel && `${stepLabel} - `}Step {currentStep} of {totalSteps}
        </div>
        <div className="text-sm font-mono font-bold text-teal-400">{Math.round(progress)}%</div>
      </div>
      {/* Progress bar */}
      <div className="relative w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="relative bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}