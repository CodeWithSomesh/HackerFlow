"use client"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabel?: string
}

export function ProgressIndicator({ currentStep, totalSteps, stepLabel }: ProgressIndicatorProps) {
  const progress = Math.max(0, Math.min(100, ((currentStep-1) / totalSteps) * 100))

  return (
    <div className="w-full mx-auto mb-8 bg-yellow-300 p-4 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-black font-bold">
          {stepLabel && `${stepLabel} - `}Step {currentStep} of {totalSteps}
        </div>
        <div className="text-sm font-bold text-black">{Math.round(progress)}%</div>
      </div>
      <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
        <div className="absolute inset-0 bg-gray-400" />
        <div
          className="relative bg-gradient-to-r from-green-400 to-cyan-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
