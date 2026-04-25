import React, { useEffect, useState, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, IndianRupee, Home, CheckCircle, XCircle, AlertTriangle, Ban, User, Clock, Shield, Star, Tag, Landmark, Calendar, RefreshCw, Wifi, Phone, Mail, Activity, TrendingUp, Images, Edit, MessageCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllProperties, updatePropertyStatus, requestPropertyCorrection } from '../../store/slices/admin.slice';
import { fetchAllUsers } from '../../store/slices/admin.slice';
import { RequestCorrectionModal } from '../../components/admin/RequestCorrectionModal';
import { EditPropertyModal } from '../../components/EditPropertyModal';
import { PropertyStatus } from '../../types/admin.types';
import { FeedbackReason, FeedbackSeverity } from '../../types/api.types';
import { Button } from '../../components/ui/Button';
import { buildPropertyWhatsappMessage, generateWhatsAppUrl, isValidWhatsAppPhone } from '../../utils/whatsappMessage';
// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
  suspended: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600',
  needs_correction: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
  draft: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
};
const STATUS_LABELS: Record<string, string> = {
  approved: 'Approved',
  pending: 'Pending Review',
  rejected: 'Rejected',
  suspended: 'Suspended',
  needs_correction: 'Needs Correction',
  draft: 'Draft'
};
const SEVERITY_STYLES: Record<string, string> = {
  minor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  major: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
};
// ─── Small reusable label/value row ───────────────────────────────────────────
function InfoRow({
  label,
  value,
  mono = false




}: {label: string;value: React.ReactNode;mono?: boolean;}) {
  return <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className={`text-sm font-medium text-navy dark:text-white text-right max-w-[60%] ${mono ? 'font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded' : ''}`}>

        {value}
      </span>
    </div>;
}
// ─── Section heading ───────────────────────────────────────────────────────────
function SectionHeading({
  icon,
  title



}: {icon: React.ReactNode;title: string;}) {
  return <div className="flex items-center gap-2 mb-4">
      <div className="text-navy dark:text-slate-300">{icon}</div>
      <h3 className="font-bold text-navy dark:text-white text-base">{title}</h3>
    </div>;
}
// ─── Main component ────────────────────────────────────────────────────────────
export function AdminPropertyDetail() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    properties,
    users,
    loading
  } = useAppSelector((state) => state.admin);
  const property = properties.find((p) => p.id === id);
  // Cross-reference owner from admin users list
  const owner = users.find((u) => u.id === property?.ownerId);
  // ── Gallery state ──────────────────────────────────────────────────────────
  const [selectedImage, setSelectedImage] = useState<string>('');
  // ── Action state ───────────────────────────────────────────────────────────
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);  const [isEditOpen, setIsEditOpen] = useState(false);  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // ── Fetch if missing ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!property && !loading) {
      dispatch(fetchAllProperties({}));
    }
  }, [dispatch, property, loading]);
  // Load users for owner cross-reference
  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchAllUsers({}));
    }
  }, [dispatch, users.length]);
  // Sync selectedImage when property loads
  useEffect(() => {
    if (property?.images?.[0] && !selectedImage) {
      setSelectedImage(property.images[0]);
    }
  }, [property, selectedImage]);
  // ── Loading / not-found states ─────────────────────────────────────────────
  if (loading && !property) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy dark:border-white mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Loading property…
          </p>
        </div>
      </div>;
  }
  if (!property) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9] dark:bg-slate-950 gap-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <Home className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-navy dark:text-white font-playfair">
          Property Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          This property may have been removed or the ID is invalid.
        </p>
        <Button onClick={() => navigate('/admin/properties')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
      </div>;
  }
  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleStatusUpdate = async (status: PropertyStatus, reason?: string) => {
    if (!id) return;
    setActionLoading(status);
    try {
      await dispatch(updatePropertyStatus({
        id,
        status,
        reason
      })).unwrap();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setActionLoading(null);
    }
  };
  const handleRequestCorrection = async (reason: FeedbackReason, message: string, severity?: FeedbackSeverity) => {
    if (!id) return;
    setActionLoading('correction');
    try {
      await dispatch(requestPropertyCorrection({
        id,
        reason,
        message,
        severity
      })).unwrap();
      setIsCorrectionModalOpen(false);
    } catch (error) {
      console.error('Failed to request correction:', error);
    } finally {
      setActionLoading(null);
    }
  };
  const handleWhatsApp = () => {
    if (!owner?.phone || !isValidWhatsAppPhone(owner.phone)) return;
    const message = buildPropertyWhatsappMessage({
      name: owner.name || 'Owner',
      title: property.title,
      propertyId: property.id,
    });
    const url = generateWhatsAppUrl(owner.phone, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  const currentStatus = property.reviewStatus || (property as any).status || 'pending';
  const allImages = property.images ?? [];
  return <div className="min-h-screen bg-[#FAFAF9] dark:bg-slate-950 pt-20 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/properties')} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">

              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-0.5">
                <span className="hover:text-navy dark:hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/admin')}>

                  Admin
                </span>
                <span>/</span>
                <span className="hover:text-navy dark:hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/admin/properties')}>

                  Properties
                </span>
                <span>/</span>
                <span className="text-navy dark:text-white truncate max-w-[120px] sm:max-w-[160px] min-w-0">
                  {property.title}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-navy dark:text-white font-playfair leading-tight">
                Property Review
              </h1>
            </div>
          </div>

          {/* Quick action buttons in header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[currentStatus] || STATUS_STYLES.pending}`}>

              {STATUS_LABELS[currentStatus] || currentStatus}
            </span>
          </div>
        </div>

        {/* ── Main grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
              {/* Main image */}
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-700">
                {selectedImage ? <img key={selectedImage} src={selectedImage} alt={property.title} className="w-full h-full object-cover transition-opacity duration-300" /> : <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                    <Images className="w-12 h-12" />
                    <span className="text-sm">No images uploaded</span>
                  </div>}
                {/* Image counter */}
                {allImages.length > 0 && <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {allImages.indexOf(selectedImage) + 1} / {allImages.length}
                  </div>}
              </div>

              {/* Thumbnails — all images, active border highlight */}
              {allImages.length > 1 && <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 overflow-x-auto">
                  {allImages.map((img, idx) => <button key={idx} onClick={() => setSelectedImage(img)} className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImage === img ? 'border-navy dark:border-white scale-105 shadow-md' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-500 opacity-70 hover:opacity-100'}`}>

                      <img src={img} alt={`View ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />

                    </button>)}
                </div>}
            </div>

            {/* Property Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              {/* Title + Price row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-navy dark:text-white font-playfair leading-tight mb-2">
                    {property.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{property.location}</span>
                    <span className="text-slate-300 dark:text-slate-600">
                      •
                    </span>
                    <span className="font-medium text-navy dark:text-white">
                      {property.city}
                    </span>
                  </div>
                  {property.landmark && <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm mt-1">
                      <Landmark className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Near {property.landmark}</span>
                    </div>}
                </div>
                <div className="sm:text-right flex-shrink-0">
                  <div className="flex items-center sm:justify-end gap-0.5 text-2xl font-bold text-navy dark:text-white">
                    <IndianRupee className="w-5 h-5" />
                    {property.pricePerMonth.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    per month
                  </div>
                </div>
              </div>

              {/* Status + badge row */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[currentStatus] || STATUS_STYLES.pending}`}>

                  {STATUS_LABELS[currentStatus] || currentStatus}
                </span>
                {property.isVerified && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    ✓ Verified
                  </span>}
                {property.isPopular && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    🔥 Popular
                  </span>}
                {!property.isActive && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                    Inactive
                  </span>}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-t border-b border-slate-100 dark:border-slate-700 mb-5">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Room Type
                  </div>
                  <div className="font-semibold text-navy dark:text-white text-sm">
                    {property.roomType}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Ideal For
                  </div>
                  <div className="font-semibold text-navy dark:text-white text-sm">
                    {Array.isArray(property.idealFor) ? property.idealFor.join(', ') : property.idealFor}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Rating
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-navy dark:text-white text-sm">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {property.rating?.toFixed(1) ?? '—'}
                    <span className="text-xs text-slate-400 font-normal">
                      ({property.reviewsCount ?? 0})
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Listed
                  </div>
                  <div className="font-semibold text-navy dark:text-white text-sm">
                    {new Date(property.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-bold text-navy dark:text-white mb-2 text-sm uppercase tracking-wider">
                  Description
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {property.description || <span className="italic text-slate-400">
                      No description provided.
                    </span>}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-bold text-navy dark:text-white mb-3 text-sm uppercase tracking-wider">
                  Amenities ({property.amenities?.length ?? 0})
                </h3>
                {property.amenities?.length > 0 ? <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, idx) => <span key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium">

                        {amenity}
                      </span>)}
                  </div> : <p className="text-slate-400 text-sm italic">
                    No amenities listed.
                  </p>}
              </div>
            </div>

            {/* Timestamps card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
              <SectionHeading icon={<Calendar className="w-4 h-4" />} title="Listing Timeline" />


              <div>
                <InfoRow label="Created" value={new Date(property.createdAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} />


                <InfoRow label="Last Updated" value={new Date(property.updatedAt).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })} />


                <InfoRow label="Property ID" value={property.id} mono />
                <InfoRow label="Owner ID" value={property.ownerId} mono />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (sticky) ────────────────────────────────────── */}
          <div className="space-y-5 lg:sticky lg:top-24">
            {/* Moderation Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
              <SectionHeading icon={<Shield className="w-4 h-4" />} title="Moderation Actions" />


              <div className="space-y-2.5">
                <Button fullWidth size="sm" className="!bg-navy hover:!bg-navy/90 !text-white border-none justify-start" onClick={() => setIsEditOpen(true)} loading={false}>

                    <Edit className="w-4 h-4 mr-2" />
                    Edit Property
                  </Button>
                {isValidWhatsAppPhone(owner?.phone) && <Button fullWidth size="sm" className="!bg-green-600 hover:!bg-green-700 !text-white border-none justify-start" onClick={handleWhatsApp}>

                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send WhatsApp
                  </Button>}
                {currentStatus !== 'approved' && <Button fullWidth size="sm" className="!bg-green-600 hover:!bg-green-700 !text-white border-none justify-start" onClick={() => handleStatusUpdate('approved')} loading={actionLoading === 'approved'}>

                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Property
                  </Button>}
                {currentStatus !== 'needs_correction' && <Button fullWidth size="sm" variant="outline" className="!border-orange-400 !text-orange-600 hover:!bg-orange-50 dark:!border-orange-500 dark:!text-orange-400 dark:hover:!bg-orange-900/20 justify-start" onClick={() => setIsCorrectionModalOpen(true)}>

                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Request Correction
                  </Button>}
                {currentStatus !== 'rejected' && <Button fullWidth size="sm" variant="outline" className="!border-red-200 !text-red-600 hover:!bg-red-50 dark:!border-red-800 dark:!text-red-400 dark:hover:!bg-red-900/20 justify-start" onClick={() => handleStatusUpdate('rejected')} loading={actionLoading === 'rejected'}>

                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Property
                  </Button>}
                {currentStatus !== 'suspended' && <Button fullWidth size="sm" variant="ghost" className="!text-slate-500 hover:!bg-slate-100 dark:!text-slate-400 dark:hover:!bg-slate-700 justify-start" onClick={() => handleStatusUpdate('suspended')} loading={actionLoading === 'suspended'}>

                    <Ban className="w-4 h-4 mr-2" />
                    Suspend Property
                  </Button>}
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
              <SectionHeading icon={<User className="w-4 h-4" />} title="Owner Information" />


              {owner ? <div>
                  {/* Owner avatar + name */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-navy/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-navy dark:text-white font-bold text-sm">
                        {owner.name?.charAt(0).toUpperCase() ?? 'O'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-navy dark:text-white text-sm">
                        {owner.name}
                      </div>
                      <div className="text-xs text-slate-400 capitalize">
                        {owner.role?.toLowerCase()}
                      </div>
                    </div>
                  </div>
                  <InfoRow label="Email" value={<a href={`mailto:${owner.email}`} className="text-navy dark:text-blue-400 hover:underline">

                        {owner.email}
                      </a>} />


                  {owner.phone && <InfoRow label="Phone" value={<a href={`tel:${owner.phone}`} className="text-navy dark:text-blue-400 hover:underline">

                          {owner.phone}
                        </a>} />}
                  {owner.city && <InfoRow label="City" value={owner.city} />}
                  <InfoRow label="Joined" value={new Date(owner.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })} />

                </div> : <div>
                  <InfoRow label="Owner ID" value={`${property.ownerId.substring(0, 12)}…`} mono />


                  <p className="text-xs text-slate-400 mt-3 italic">
                    Load users list to see full owner details.
                  </p>
                </div>}
            </div>

            {/* Current Admin Feedback (only shown when status is needs_correction) */}
            {currentStatus?.toLowerCase() === 'needs_correction' && property.adminFeedback && <div className="bg-orange-50 dark:bg-orange-900/10 rounded-2xl p-5 border border-orange-200 dark:border-orange-800">
                  <SectionHeading icon={<AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />} title="Current Feedback" />


                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-navy dark:text-white capitalize">
                        {property.adminFeedback.reasonLabel || property.adminFeedback.reason.replace(/_/g, ' ')}
                      </span>
                      {property.adminFeedback.severity && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_STYLES[property.adminFeedback.severity]}`}>

                          {property.adminFeedback.severity}
                        </span>}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {property.adminFeedback.message}
                    </p>
                    <div className="flex justify-between text-xs text-slate-400 pt-1 border-t border-orange-200 dark:border-orange-800">
                      <span>
                        By {property.adminFeedback.adminName || 'Admin'}
                      </span>
                      <span>
                        {new Date(property.adminFeedback.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>}

            {/* Feedback History */}
            {property.feedbackHistory && property.feedbackHistory.length > 0 && <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                  <SectionHeading icon={<Clock className="w-4 h-4" />} title={`Feedback History (${property.feedbackHistory.length})`} />


                  <div className="space-y-3">
                    {property.feedbackHistory.map((feedback, idx) => <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm">

                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-navy dark:text-white capitalize text-xs">
                              {feedback.reasonLabel || feedback.reason.replace(/_/g, ' ')}
                            </span>
                            {feedback.severity && <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${SEVERITY_STYLES[feedback.severity]}`}>

                                {feedback.severity}
                              </span>}
                          </div>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {new Date(feedback.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short'
                    })}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {feedback.message}
                        </p>
                        <div className="text-xs text-slate-400 mt-1.5">
                          — {feedback.adminName || 'Admin'}
                        </div>
                      </div>)}
                  </div>
                </div>}
          </div>
        </div>
      </div>

      {/* Correction Modal */}
      <RequestCorrectionModal isOpen={isCorrectionModalOpen} onClose={() => setIsCorrectionModalOpen(false)} onConfirm={handleRequestCorrection} propertyTitle={property.title} />

      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        room={property}
        isAdmin={true}
        onEditComplete={() => {
          setIsEditOpen(false);
          dispatch(fetchAllProperties({}));
        }}
      />

    </div>;
}
