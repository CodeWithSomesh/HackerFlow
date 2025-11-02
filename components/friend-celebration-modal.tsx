'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Users, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import Link from 'next/link'

interface FriendCelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  friendName: string
  friendImage?: string
  friendId: string
}

export function FriendCelebrationModal({
  isOpen,
  onClose,
  friendName,
  friendImage,
  friendId
}: FriendCelebrationModalProps) {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false)

  useEffect(() => {
    if (isOpen && !hasTriggeredConfetti) {
      triggerConfetti()
      setHasTriggeredConfetti(true)
    }

    if (!isOpen) {
      setHasTriggeredConfetti(false)
    }
  }, [isOpen, hasTriggeredConfetti])

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      // Confetti from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#EC4899', '#A855F7', '#14B8A6', '#FACC15', '#F43F5E']
      })

      // Confetti from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#EC4899', '#A855F7', '#14B8A6', '#FACC15', '#F43F5E']
      })
    }, 250)

    // Burst of confetti in center
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EC4899', '#A855F7', '#14B8A6', '#FACC15', '#F43F5E'],
        zIndex: 99999
      })
    }, 200)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute -top-4 -right-4 w-10 h-10 bg-gray-900 border-2 border-gray-700 rounded-full flex items-center justify-center hover:border-pink-500 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {/* Card */}
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-4 border-pink-500 rounded-2xl p-8 shadow-2xl shadow-pink-500/20">
                {/* Animated heart icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full blur-xl opacity-50 animate-pulse" />
                    <div className="relative w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                      <Heart className="w-10 h-10 text-white" fill="white" />
                    </div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mb-4"
                >
                  <h2 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-yellow-400 mb-2">
                    You're Friends Now!
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-gray-300">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <p className="text-lg font-mono">Friendship Established</p>
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </div>
                </motion.div>

                {/* Friend info */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center gap-4 mb-6"
                >
                  {/* Friend image */}
                  {friendImage ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-md opacity-50" />
                      <img
                        src={friendImage}
                        alt={friendName}
                        className="relative w-24 h-24 rounded-full border-4 border-teal-400 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-md opacity-50" />
                      <div className="relative w-24 h-24 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full border-4 border-teal-400 flex items-center justify-center">
                        <Users className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-1">{friendName}</p>
                    <p className="text-gray-400 font-mono text-sm">
                      Start Collaborating!
                    </p>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col gap-3"
                >
                  <Link href={`/profile/${friendId}`}>
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-mono font-bold rounded-lg border-2 border-teal-400 shadow-lg shadow-teal-500/30 transition-all">
                      View Profile
                    </button>
                  </Link>

                  <Link href="/profile?tab=friends">
                    <button className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-mono font-bold rounded-lg border-2 border-gray-700 transition-all">
                      View All Friends
                    </button>
                  </Link>

                  <button
                    onClick={onClose}
                    className="w-full px-6 py-3 bg-transparent hover:bg-gray-800/50 text-gray-400 hover:text-white font-mono rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-teal-500/20 rounded-full blur-2xl animate-pulse" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
