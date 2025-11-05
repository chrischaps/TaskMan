import { useState, useEffect } from 'react'

/**
 * Custom hook to track time remaining until task expiration
 *
 * @param expiresAt - The expiration timestamp (Date string or null)
 * @returns Object with time remaining, formatted string, and expiration status
 */
export function useTaskTimer(expiresAt: string | Date | null | undefined) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  useEffect(() => {
    if (!expiresAt) {
      setTimeRemaining(0)
      return
    }

    const calculateTimeRemaining = () => {
      const now = Date.now()
      const expiration = new Date(expiresAt).getTime()
      const remaining = Math.max(0, expiration - now)
      setTimeRemaining(remaining)
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)

  return {
    timeRemaining,
    minutes,
    seconds,
    isExpired: timeRemaining === 0,
    formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    isLowTime: timeRemaining < 60000, // Less than 1 minute remaining
  }
}
