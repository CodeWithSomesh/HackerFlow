'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, FileText, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react'
import { showCustomToast } from '@/components/toast-notification'
import { uploadIdentityDocument, uploadAuthorizationLetter } from '@/lib/actions/createHackathon-actions'

interface OrganizerVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVerificationComplete: (identityDocUrl: string, authLetterUrl: string) => void
  existingIdentityUrl?: string
  existingAuthLetterUrl?: string
  hackathonId?: string
}

export function OrganizerVerificationModal({
  open,
  onOpenChange,
  onVerificationComplete,
  existingIdentityUrl = '',
  existingAuthLetterUrl = '',
  hackathonId
}: OrganizerVerificationModalProps) {
  const [identityDoc, setIdentityDoc] = useState<File | null>(null)
  const [authorizationLetter, setAuthorizationLetter] = useState<File | null>(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToLiability, setAgreedToLiability] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleIdentityUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        showCustomToast('error', 'Please upload a PDF or image file (JPG, PNG)')
        return
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showCustomToast('error', 'File size must be less than 5MB')
        return
      }
      setIdentityDoc(file)
      showCustomToast('success', 'Identity document selected')
    }
  }

  const handleAuthorizationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        showCustomToast('error', 'Please upload a PDF or image file (JPG, PNG)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showCustomToast('error', 'File size must be less than 5MB')
        return
      }
      setAuthorizationLetter(file)
      showCustomToast('success', 'Authorization letter selected')
    }
  }

  const handleSubmit = async () => {
    // Validation - check if we have either existing docs or new uploads
    const hasIdentity = existingIdentityUrl || identityDoc
    const hasAuth = existingAuthLetterUrl || authorizationLetter

    if (!hasIdentity) {
      showCustomToast('error', 'Please upload your identity document')
      return
    }
    if (!hasAuth) {
      showCustomToast('error', 'Please upload your authorization letter')
      return
    }
    if (!agreedToTerms) {
      showCustomToast('error', 'Please agree to the verification terms')
      return
    }
    if (!agreedToLiability) {
      showCustomToast('error', 'Please acknowledge the liability agreement')
      return
    }

    setIsUploading(true)

    try {
      let finalIdentityUrl = existingIdentityUrl
      let finalAuthUrl = existingAuthLetterUrl

      // Only upload if new files selected - now passing hackathonId
      if (identityDoc) {
        const identityResult = await uploadIdentityDocument(identityDoc, hackathonId)
        if (!identityResult.success) {
          showCustomToast('error', identityResult.error || 'Failed to upload identity document')
          setIsUploading(false)
          return
        }
        finalIdentityUrl = identityResult.url || ''
      }

      if (authorizationLetter) {
        const authResult = await uploadAuthorizationLetter(authorizationLetter, hackathonId)
        if (!authResult.success) {
          showCustomToast('error', authResult.error || 'Failed to upload authorization letter')
          setIsUploading(false)
          return
        }
        finalAuthUrl = authResult.url || ''
      }

      showCustomToast('success', 'Verification documents submitted successfully!')
      onVerificationComplete(finalIdentityUrl, finalAuthUrl)
      onOpenChange(false)

      // Reset form
      setIdentityDoc(null)
      setAuthorizationLetter(null)
      setAgreedToTerms(false)
      setAgreedToLiability(false)
    } catch (error) {
      console.error('Upload error:', error)
      showCustomToast('error', 'Failed to submit verification documents')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-gradient-to-br from-gray-900 to-gray-800 z-10 pb-4">
          <DialogTitle className="font-blackops text-2xl text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            Organizer Verification Required
          </DialogTitle>
          <DialogDescription className="text-gray-300 font-mono text-sm pt-4">
            To ensure the safety and authenticity of events on HackerFlow, we require all organizers to complete identity verification before publishing their hackathon.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-10 mt-6 px-1">
          {/* Identity Document Upload */}
          <div className="space-y-3">
            <Label className="text-gray-200 font-mono flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Identity Verification Document *
            </Label>
            {existingIdentityUrl && !identityDoc && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-300 font-mono text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Document already uploaded - you can skip this or upload a new one
                </p>
              </div>
            )}
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Upload a government-issued ID (Driver&apos;s License, Passport, National ID, or similar) to verify your identity. This helps prevent fraud and ensures participant safety.
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleIdentityUpload}
                className="hidden"
                id="identity-upload"
              />
              <label
                htmlFor="identity-upload"
                className="flex items-center gap-3 p-4 bg-black/40 border-2 border-dashed border-gray-600 hover:border-teal-500 rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 text-teal-400" />
                <div className="flex-1">
                  <p className="text-gray-200 font-mono text-sm">
                    {identityDoc ? identityDoc.name : existingIdentityUrl ? 'Click to upload a new identity document' : 'Click to upload identity document'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">PDF, JPG, or PNG (Max 5MB)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Authorization Letter Upload */}
          <div className="space-y-3">
            <Label className="text-gray-200 font-mono flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Authorization Letter *
            </Label>
            {existingAuthLetterUrl && !authorizationLetter && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-300 font-mono text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Document already uploaded - you can skip this or upload a new one
                </p>
              </div>
            )}
            <p className="text-xs text-gray-400 font-mono leading-relaxed">
              Upload an official letter from your university, organization, or institution confirming you are authorized to organize this event and will take responsibility for participant welfare and event execution.
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleAuthorizationUpload}
                className="hidden"
                id="authorization-upload"
              />
              <label
                htmlFor="authorization-upload"
                className="flex items-center gap-3 p-4 bg-black/40 border-2 border-dashed border-gray-600 hover:border-teal-500 rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 text-teal-400" />
                <div className="flex-1">
                  <p className="text-gray-200 font-mono text-sm">
                    {authorizationLetter ? authorizationLetter.name : existingAuthLetterUrl ? 'Click to upload a new authorization letter' : 'Click to upload authorization letter'}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">PDF, JPG, or PNG (Max 5MB)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-200 font-mono text-sm font-semibold">
                Important Legal Agreement
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1 border-gray-500 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
              />
              <label
                htmlFor="terms"
                className="text-xs text-gray-300 font-mono leading-relaxed cursor-pointer"
              >
                I confirm that all information provided is accurate and that I am authorized to organize this event. I understand that HackerFlow will verify my identity and authorization before approving this hackathon for publication.
              </label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="liability"
                checked={agreedToLiability}
                onCheckedChange={(checked) => setAgreedToLiability(checked as boolean)}
                className="mt-1 border-gray-500 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
              />
              <label
                htmlFor="liability"
                className="text-xs text-gray-300 font-mono leading-relaxed cursor-pointer"
              >
                I accept full responsibility for the safety and well-being of all participants. I acknowledge that in case of any incidents, legal disputes, or participant harm, I and my organization will be held liable. I understand that HackerFlow and its affiliates are not responsible for event execution or participant safety, and that participants or HackerFlow may take legal action against me/my organization if necessary.
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-xs text-blue-200 font-mono leading-relaxed">
              <strong>Why is this required?</strong> This verification process protects both organizers and participants. It helps prevent fraudulent events, ensures accountability, and creates a safer environment for the hackathon community. Your documents will be securely stored and only reviewed by HackerFlow administrators.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3 sticky bottom-0 bg-gradient-to-br from-gray-900 to-gray-800 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            className="bg-gray-800 hover:bg-gray-700 border-gray-600 text-white font-mono"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || !agreedToTerms || !agreedToLiability || (!existingIdentityUrl && !identityDoc) || (!existingAuthLetterUrl && !authorizationLetter)}
            className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 hover:from-purple-600 hover:via-blue-600 hover:to-teal-600 text-white font-mono font-bold disabled:opacity-50"
          >
            {isUploading ? 'Submitting...' : 'Submit for Verification'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}