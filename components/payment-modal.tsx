'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { CreditCard, DollarSign, ShieldAlert, Lock } from 'lucide-react'
import { showCustomToast } from '@/components/toast-notification'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPaymentComplete: () => void
  amount: number
  hackathonTitle: string
}

export function PaymentModal({
  open,
  onOpenChange,
  onPaymentComplete,
  amount,
  hackathonTitle
}: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [agreedToNoRefund, setAgreedToNoRefund] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted)
    }
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    if (formatted.replace(/\//g, '').length <= 4) {
      setExpiryDate(formatted)
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, '')
    if (value.length <= 4) {
      setCvv(value)
    }
  }

  const handlePayment = async () => {
    // Validation
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      showCustomToast('error', 'Please enter a valid 16-digit card number')
      return
    }
    if (!cardName || cardName.trim().length < 3) {
      showCustomToast('error', 'Please enter the cardholder name')
      return
    }
    if (!expiryDate || expiryDate.length !== 5) {
      showCustomToast('error', 'Please enter a valid expiry date (MM/YY)')
      return
    }
    if (!cvv || cvv.length < 3) {
      showCustomToast('error', 'Please enter a valid CVV')
      return
    }
    if (!agreedToNoRefund) {
      showCustomToast('error', 'Please acknowledge the no-refund policy')
      return
    }

    // Validate expiry date
    const [month, year] = expiryDate.split('/')
    const expMonth = parseInt(month)
    const expYear = parseInt('20' + year)
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    if (expMonth < 1 || expMonth > 12) {
      showCustomToast('error', 'Invalid expiry month')
      return
    }
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      showCustomToast('error', 'Card has expired')
      return
    }

    setIsProcessing(true)

    try {
      // TODO: Integrate with actual payment gateway (Stripe, Razorpay, etc.)
      // For now, we'll simulate the payment
      await new Promise(resolve => setTimeout(resolve, 2000))

      showCustomToast('success', 'Payment processed successfully!')
      onPaymentComplete()
      onOpenChange(false)

      // Reset form
      setCardNumber('')
      setCardName('')
      setExpiryDate('')
      setCvv('')
      setAgreedToNoRefund(false)
    } catch (error) {
      showCustomToast('error', 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="sticky top-0 bg-gradient-to-br from-gray-900 to-gray-800 z-10 pb-4 flex-shrink-0">
          <DialogTitle className="font-blackops text-xl sm:text-2xl text-white flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="truncate">Payment Required</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300 font-mono text-xs sm:text-sm pt-2">
            Complete payment to publish your hackathon on HackerFlow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-4 overflow-y-auto flex-1 px-1">
          {/* Payment Summary */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-500/10 to-teal-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <span className="text-gray-300 font-mono text-xs sm:text-sm">Hackathon:</span>
              <span className="text-white font-mono text-xs sm:text-sm font-semibold break-words line-clamp-2">{hackathonTitle}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <span className="text-gray-300 font-mono text-xs sm:text-sm flex items-center gap-2">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                Total Amount:
              </span>
              <span className="text-teal-400 font-blackops text-xl sm:text-2xl">${amount}</span>
            </div>
          </div>

          {/* Card Details */}
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-200 font-mono text-xs sm:text-sm flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Card Number
              </Label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                className="bg-black/60 border-gray-700 text-gray-100 font-mono text-sm"
                maxLength={19}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-200 font-mono text-xs sm:text-sm">Cardholder Name</Label>
              <Input
                placeholder="JOHN DOE"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                className="bg-black/60 border-gray-700 text-gray-100 font-mono uppercase text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-gray-200 font-mono text-xs sm:text-sm">Expiry Date</Label>
                <Input
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  className="bg-black/60 border-gray-700 text-gray-100 font-mono text-sm"
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-200 font-mono text-xs sm:text-sm">CVV</Label>
                <Input
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={handleCvvChange}
                  className="bg-black/60 border-gray-700 text-gray-100 font-mono text-sm"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* No Refund Policy */}
          <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-red-200 font-mono text-xs sm:text-sm font-semibold mb-2">
                  No Refund Policy
                </p>
                <p className="text-red-100/80 font-mono text-xs leading-relaxed break-words">
                  All payments are final and non-refundable. Once your hackathon is published, you cannot request a refund regardless of the outcome or number of participants. Please ensure all details are correct before proceeding with payment.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="no-refund"
                checked={agreedToNoRefund}
                onCheckedChange={(checked) => setAgreedToNoRefund(checked as boolean)}
                className="mt-1 border-gray-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 flex-shrink-0"
              />
              <label
                htmlFor="no-refund"
                className="text-xs text-gray-300 font-mono leading-relaxed cursor-pointer break-words"
              >
                I understand and agree that this payment is non-refundable under all circumstances, and I have reviewed all hackathon details before making this payment.
              </label>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-xs text-green-200 font-mono leading-relaxed flex items-start gap-2 break-words">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
              <span>Your payment information is encrypted and secure. We never store your full card details.</span>
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3 sticky bottom-0 bg-gradient-to-br from-gray-900 to-gray-800 pt-4 border-t border-gray-700 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-white font-mono text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !agreedToNoRefund}
            className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white font-mono font-bold disabled:opacity-50 text-sm"
          >
            {isProcessing ? 'Processing...' : `Pay $${amount}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}