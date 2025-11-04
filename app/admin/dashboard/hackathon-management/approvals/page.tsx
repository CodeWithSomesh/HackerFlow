'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPendingHackathons, approveHackathon, rejectHackathon, getRevenueStats, getAllHackathonsForAdmin } from '@/lib/actions/admin-actions'
import { FileCheck, CheckCircle, XCircle, Eye, FileText, Building, Calendar, ExternalLink, Filter } from 'lucide-react'
import { showCustomToast } from '@/components/toast-notification'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
// ===== DUMMY DATA IMPORTS - REMOVE BEFORE PRODUCTION =====
import { DUMMY_PENDING_HACKATHONS, isDummyDataEnabled, mergeDummyData } from '@/lib/dummy-data/admin-dummy-data'
// ========================================================

type FilterStatus = 'all' | 'pending' | 'verified' | 'rejected'

export default function ApprovalsPage() {
  const [hackathons, setHackathons] = useState<any[]>([])
  const [filteredHackathons, setFilteredHackathons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [viewDetailsModal, setViewDetailsModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending')
  const [stats, setStats] = useState<any>(null)
  // ===== DUMMY DATA STATE - REMOVE BEFORE PRODUCTION =====
  const [useDummyData, setUseDummyData] = useState(false)
  // ========================================================

  useEffect(() => {
    // ===== DUMMY DATA INITIALIZATION - REMOVE BEFORE PRODUCTION =====
    setUseDummyData(isDummyDataEnabled())
    // ================================================================
    loadData()
  }, [])

  useEffect(() => {
    filterHackathons()
  }, [filterStatus, hackathons])

  async function loadData() {
    setLoading(true)

    // Load stats and ALL hackathons (not just pending) in parallel
    const [statsResult, hackathonsResult] = await Promise.all([
      getRevenueStats(),
      getAllHackathonsForAdmin() // Changed from getPendingHackathons to get ALL hackathons
    ])

    if (statsResult.success) {
      setStats(statsResult.data)
    }

    if (hackathonsResult.success) {
      // ===== DUMMY DATA MERGE - REMOVE BEFORE PRODUCTION =====
      // Replace the next 2 lines with: setHackathons(hackathonsResult.data || [])
      const realData = hackathonsResult.data || []
      const mergedData = mergeDummyData(realData, DUMMY_PENDING_HACKATHONS)
      setHackathons(mergedData)
      // ========================================================
    } else {
      // ===== DUMMY DATA FALLBACK - REMOVE BEFORE PRODUCTION =====
      // Remove this entire if-else block and keep only the else part
      if (isDummyDataEnabled()) {
        setHackathons(DUMMY_PENDING_HACKATHONS)
      } else {
        showCustomToast('error', 'Failed to load hackathons')
        setHackathons([])
      }
      // ===========================================================
    }

    setLoading(false)
  }

  function filterHackathons() {
    if (filterStatus === 'all') {
      setFilteredHackathons(hackathons)
    } else {
      const filtered = hackathons.filter(h => {
        if (filterStatus === 'verified') {
          return h.verification_status === 'verified' || h.verification_status === 'confirmed'
        }
        return h.verification_status === filterStatus
      })
      setFilteredHackathons(filtered)
    }
  }

  function openActionDialog(hackathon: any, type: 'approve' | 'reject') {
    setSelectedHackathon(hackathon)
    setActionType(type)
    setRejectionReason('')
  }

  function closeActionDialog() {
    setSelectedHackathon(null)
    setActionType(null)
    setRejectionReason('')
  }

  async function handleApprove() {
    if (!selectedHackathon) return

    setIsProcessing(true)
    const result = await approveHackathon(selectedHackathon.id)

    if (result.success) {
      showCustomToast('success', 'Hackathon approved successfully')
      closeActionDialog()
      loadData()
    } else {
      showCustomToast('error', result.message || 'Failed to approve hackathon')
    }

    setIsProcessing(false)
  }

  async function handleReject() {
    if (!selectedHackathon || !rejectionReason.trim()) {
      showCustomToast('error', 'Please provide a rejection reason')
      return
    }

    setIsProcessing(true)
    const result = await rejectHackathon(selectedHackathon.id, rejectionReason)

    if (result.success) {
      showCustomToast('success', 'Hackathon rejected')
      closeActionDialog()
      loadData()
    } else {
      showCustomToast('error', result.message || 'Failed to reject hackathon')
    }

    setIsProcessing(false)
  }

  function viewHackathonDetails(hackathon: any) {
    setSelectedHackathon(hackathon)
    setViewDetailsModal(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-400 font-mono">Pending</Badge>
      case 'verified':
      case 'confirmed':
        return <Badge className="bg-green-500/20 text-green-400 border border-green-400 font-mono">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border border-red-400 font-mono">Rejected</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border border-gray-400 font-mono">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  const pendingCount = stats?.pending_approvals || hackathons.filter(h => h.verification_status === 'pending').length
  const approvedCount = stats?.approved_hackathons || hackathons.filter(h => h.verification_status === 'verified' || h.verification_status === 'confirmed').length
  const rejectedCount = stats?.rejected_hackathons || hackathons.filter(h => h.verification_status === 'rejected').length

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-blackops text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 mb-2">
          HACKATHON APPROVALS
        </h1>
        <p className="text-gray-400 font-mono">
          Review and verify hackathon submissions
        </p>
      </div>
      {/* ===== DUMMY DATA TOGGLE REMOVED - Now in layout ===== */}

      {/* Hackathon Status Overview - Clickable Filters */}
      <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-blackops flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-purple-400" />
            Hackathon Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pending Status Card */}
            <button
              onClick={() => setFilterStatus('pending')}
              className={`p-4 bg-yellow-500/10 border-2 ${filterStatus === 'pending' ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-yellow-500/30'} rounded-md hover:scale-105 transition-all cursor-pointer text-left`}
            >
              <p className="text-yellow-400 font-mono text-sm mb-2 flex items-center justify-between">
                Pending Approval
                {filterStatus === 'pending' && <Filter className="h-4 w-4" />}
              </p>
              <p className="text-3xl font-blackops text-yellow-400">
                {pendingCount}
              </p>
            </button>

            {/* Approved Status Card */}
            <button
              onClick={() => setFilterStatus('verified')}
              className={`p-4 bg-green-500/10 border-2 ${filterStatus === 'verified' ? 'border-green-400 ring-2 ring-green-400/50' : 'border-green-500/30'} rounded-md hover:scale-105 transition-all cursor-pointer text-left`}
            >
              <p className="text-green-400 font-mono text-sm mb-2 flex items-center justify-between">
                Approved
                {filterStatus === 'verified' && <Filter className="h-4 w-4" />}
              </p>
              <p className="text-3xl font-blackops text-green-400">
                {approvedCount}
              </p>
            </button>

            {/* Rejected Status Card */}
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`p-4 bg-red-500/10 border-2 ${filterStatus === 'rejected' ? 'border-red-400 ring-2 ring-red-400/50' : 'border-red-500/30'} rounded-md hover:scale-105 transition-all cursor-pointer text-left`}
            >
              <p className="text-red-400 font-mono text-sm mb-2 flex items-center justify-between">
                Rejected
                {filterStatus === 'rejected' && <Filter className="h-4 w-4" />}
              </p>
              <p className="text-3xl font-blackops text-red-400">
                {rejectedCount}
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Info */}
      {/* {filterStatus !== 'all' && (
        <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/30 rounded-md">
          <p className="text-purple-400 font-mono text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Showing {filterStatus === 'verified' ? 'approved' : filterStatus} hackathons only
          </p>
          <Button
            onClick={() => setFilterStatus('all')}
            variant="outline"
            size="sm"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-mono"
          >
            Show All
          </Button>
        </div>
      )} */}

      {/* Hackathons List */}
      {filteredHackathons.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800">
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-blackops text-white mb-2">No Hackathons Found!</h3>
              <p className="text-gray-400 font-mono">
                No hackathons with status: {filterStatus === 'verified' ? 'approved' : filterStatus}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHackathons.map((hackathon) => (
            <Card key={hackathon.id} className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 hover:border-purple-400 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-white font-blackops text-xl mb-2">
                      {hackathon.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {hackathon.organization}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(hackathon.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(hackathon.verification_status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Organizer Info */}
                <div className="p-4 bg-gray-800/50 rounded-md">
                  <p className="text-gray-400 font-mono text-sm mb-2">Organizer Information</p>
                  <div className="space-y-1">
                    <p className="text-white font-semibold">{hackathon.organizer_name || 'N/A'}</p>
                    <p className="text-gray-400 text-sm font-mono">{hackathon.organizer_email || 'N/A'}</p>
                    {hackathon.organizer_organization && (
                      <p className="text-gray-400 text-sm font-mono">{hackathon.organizer_organization}</p>
                    )}
                  </div>
                </div>

                {/* About */}
                <div className="p-4 bg-gray-800/50 rounded-md">
                  <p className="text-gray-400 font-mono text-sm mb-2">About</p>
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {hackathon.about?.replace(/<[^>]*>/g, '') || 'No description'}
                  </p>
                </div>

                {/* Rejection Reason (if rejected) */}
                {hackathon.verification_status === 'rejected' && hackathon.rejection_reason && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md">
                    <p className="text-red-400 font-mono text-sm mb-2">Rejection Reason</p>
                    <p className="text-red-300 text-sm">{hackathon.rejection_reason}</p>
                  </div>
                )}

                {/* Documents */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hackathon.identity_document_url && (
                    <a
                      href={hackathon.identity_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-md hover:bg-blue-500/20 transition-colors flex items-center gap-3"
                    >
                      <FileText className="h-5 w-5 text-blue-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-blue-400 font-mono text-sm font-bold">Identity Document</p>
                        <p className="text-gray-400 text-xs font-mono truncate">View uploaded document</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-blue-400" />
                    </a>
                  )}
                  {hackathon.authorization_letter_url && (
                    <a
                      href={hackathon.authorization_letter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-md hover:bg-purple-500/20 transition-colors flex items-center gap-3"
                    >
                      <FileText className="h-5 w-5 text-purple-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-purple-400 font-mono text-sm font-bold">Authorization Letter</p>
                        <p className="text-gray-400 text-xs font-mono truncate">View uploaded letter</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-purple-400" />
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={() => viewHackathonDetails(hackathon)}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 font-mono"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>

                  {hackathon.verification_status === 'pending' && (
                    <>
                      <Button
                        onClick={() => openActionDialog(hackathon, 'approve')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-mono font-bold"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => openActionDialog(hackathon, 'reject')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono font-bold"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}

                  {hackathon.verification_status === 'verified' && (
                    <>
                      <Button
                        onClick={() => openActionDialog(hackathon, 'reject')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono font-bold"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}


                  {hackathon.verification_status === 'rejected' && (
                    <Button
                      onClick={() => openActionDialog(hackathon, 'approve')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-mono font-bold"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={actionType === 'approve'} onOpenChange={closeActionDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-green-400 font-blackops">
              {selectedHackathon?.verification_status === 'rejected' ? 'Re-Approve Hackathon' : 'Approve Hackathon'}
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-mono">
              Are you sure you want to approve this hackathon? This will publish it and charge the RM 20.00 posting fee.
            </DialogDescription>
          </DialogHeader>
          {selectedHackathon && (
            <div className="p-4 bg-gray-800 rounded-md">
              <p className="font-bold text-white mb-1">{selectedHackathon.title}</p>
              <p className="text-sm text-gray-400 font-mono">{selectedHackathon.organization}</p>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={closeActionDialog}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white font-bold"
              disabled={isProcessing}
            >
              {isProcessing ? 'Approving...' : 'Confirm Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionType === 'reject'} onOpenChange={closeActionDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400 font-blackops">Reject Hackathon</DialogTitle>
            <DialogDescription className="text-gray-400 font-mono">
              Please provide a reason for rejecting this hackathon. The organizer will be notified.
            </DialogDescription>
          </DialogHeader>
          {selectedHackathon && (
            <div className="p-4 bg-gray-800 rounded-md mb-4">
              <p className="font-bold text-white mb-1">{selectedHackathon.title}</p>
              <p className="text-sm text-gray-400 font-mono">{selectedHackathon.organization}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-mono text-gray-300">Rejection Reason</label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please explain why this hackathon cannot be approved..."
              className="bg-black border-gray-700 text-white font-mono min-h-32"
              disabled={isProcessing}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={closeActionDialog}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsModal} onOpenChange={setViewDetailsModal}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-purple-400 font-blackops">Hackathon Details</DialogTitle>
          </DialogHeader>
          {selectedHackathon && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedHackathon.title}</h3>
                <p className="text-gray-400 font-mono">{selectedHackathon.organization}</p>
                <div className="mt-2">{getStatusBadge(selectedHackathon.verification_status)}</div>
              </div>
              <div className="p-4 bg-gray-800 rounded-md">
                <p className="text-sm font-mono text-gray-400 mb-2">About</p>
                <p className="text-gray-300">{selectedHackathon.about?.replace(/<[^>]*>/g, '') || 'No description'}</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-md">
                <p className="text-sm font-mono text-gray-400 mb-2">Organizer</p>
                <div className="space-y-1">
                  <p className="text-white">{selectedHackathon.organizer_name}</p>
                  <p className="text-gray-400 font-mono text-sm">{selectedHackathon.organizer_email}</p>
                  {selectedHackathon.organizer_organization && (
                    <p className="text-gray-400 font-mono text-sm">{selectedHackathon.organizer_organization}</p>
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-800 rounded-md">
                <p className="text-sm font-mono text-gray-400 mb-2">Submitted On</p>
                <p className="text-white font-mono">{new Date(selectedHackathon.created_at).toLocaleString()}</p>
              </div>
              {selectedHackathon.rejection_reason && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md">
                  <p className="text-sm font-mono text-red-400 mb-2">Rejection Reason</p>
                  <p className="text-red-300">{selectedHackathon.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
