import React, { useEffect, useState, lazy } from 'react';
import { Search, MapPin, IndianRupee, Home, Clock, MessageCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllProperties, requestPropertyCorrection } from '../../store/slices/admin.slice';
import { RequestCorrectionModal } from '../../components/admin/RequestCorrectionModal';
import { Room, FeedbackReason, FeedbackSeverity } from '../../types/api.types';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import { getRelativeTime, getTimeTooltip } from '../../utils/dateFormatting';

/**
 * PROMPT 2: Derive engagement status from timestamps
 * NOT_RESPONDED: Contacted but no login
 * VIEWED: Login happened but no property update
 * ACTIVE: Property was updated
 */
type EngagementStatus = 'NOT_RESPONDED' | 'VIEWED' | 'ACTIVE' | 'UNKNOWN';

/**
 * PROMPT 3: Derive follow-up status based on engagement and timing
 */
type FollowUpStatus = 'NONE' | 'NEEDS_FOLLOWUP' | 'REMINDER';

const getEngagementStatus = (property: Room): EngagementStatus => {
  // No owner engagement data yet
  if (!property.lastContactedAt && !property.lastLoginAt && !property.lastPropertyUpdateAt) {
    return 'UNKNOWN';
  }

  // Owner updated property - highest engagement
  if (property.lastPropertyUpdateAt) {
    return 'ACTIVE';
  }

  // Owner logged in but didn't update
  if (property.lastLoginAt) {
    return 'VIEWED';
  }

  // Owner was contacted but no login yet
  if (property.lastContactedAt) {
    return 'NOT_RESPONDED';
  }

  return 'UNKNOWN';
};

const getFollowUpStatus = (property: Room): { status: FollowUpStatus; message: string } => {
  const now = new Date();
  const HOURS_24 = 24 * 60 * 60 * 1000;

  // Active owners - no follow-up needed
  if (property.lastPropertyUpdateAt) {
    const updateTime = new Date(property.lastPropertyUpdateAt).getTime();
    const diff = now.getTime() - updateTime;
    if (diff > HOURS_24) {
      return {
        status: 'REMINDER',
        message: 'Property not updated in 24+ hours. Send reminder to keep details fresh.'
      };
    }
    return {
      status: 'NONE',
      message: 'Owner actively updating property'
    };
  }

  // VIEWED: Logged in but didn't update
  if (property.lastLoginAt && !property.lastPropertyUpdateAt) {
    const loginTime = new Date(property.lastLoginAt).getTime();
    const diff = now.getTime() - loginTime;
    if (diff > HOURS_24) {
      return {
        status: 'REMINDER',
        message: 'We noticed you logged in. Please complete your property details to go live.'
      };
    }
    return {
      status: 'NONE',
      message: 'Owner recently logged in'
    };
  }

  // NOT_RESPONDED: Contacted but no login
  if (property.lastContactedAt && !property.lastLoginAt) {
    const contactTime = new Date(property.lastContactedAt).getTime();
    const diff = now.getTime() - contactTime;
    if (diff > HOURS_24) {
      return {
        status: 'NEEDS_FOLLOWUP',
        message: 'Reminder: Your property is listed on Homilivo. Please login to activate.'
      };
    }
    return {
      status: 'NONE',
      message: 'Owner recently contacted'
    };
  }

  return {
    status: 'NONE',
    message: 'No action needed'
  };
};

const getFollowUpBadge = (status: FollowUpStatus) => {
  const styles: Record<FollowUpStatus, string> = {
    NEEDS_FOLLOWUP: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
    REMINDER: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    NONE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
  };

  const labels: Record<FollowUpStatus, string> = {
    NEEDS_FOLLOWUP: '🔴 Follow-up Needed',
    REMINDER: '🟡 Reminder',
    NONE: '🟢 No Action'
  };

  return {
    style: styles[status],
    label: labels[status]
  };
};

const getEngagementBadge = (status: EngagementStatus) => {
  const styles: Record<EngagementStatus, string> = {
    ACTIVE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
    VIEWED: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    NOT_RESPONDED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
    UNKNOWN: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
  };

  const labels: Record<EngagementStatus, string> = {
    ACTIVE: '✓ Active',
    VIEWED: '📖 Viewed',
    NOT_RESPONDED: '⏳ No Response',
    UNKNOWN: '—'
  };

  return {
    style: styles[status],
    label: labels[status]
  };
};

export function AdminProperties() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    properties,
    loading
  } = useAppSelector((state) => state.admin);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [correctionProperty, setCorrectionProperty] = useState<Room | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingWhatsAppLinks, setPendingWhatsAppLinks] = useState<{ url: string; property: Room }[]>([]);
  const [currentWhatsAppIndex, setCurrentWhatsAppIndex] = useState<number>(0);
  // PROMPT 3: Follow-up tracking
  const [followUpSelectedIds, setFollowUpSelectedIds] = useState<Set<string>>(new Set());
  const [showFollowUpConfirm, setShowFollowUpConfirm] = useState(false);
  useEffect(() => {
    dispatch(fetchAllProperties());
  }, [dispatch]);
  const handleRequestCorrection = (reason: FeedbackReason, message: string, severity?: FeedbackSeverity) => {
    if (correctionProperty) {
      dispatch(requestPropertyCorrection({
        id: correctionProperty.id,
        reason,
        message,
        severity
      }));
    }
  };
  const filteredProperties = properties.filter((property) => {
    const status = property.reviewStatus || (property as any).status || 'approved';
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) || property.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  const getStatusBadge = (property: Room) => {
    const status = property.reviewStatus || (property as any).status || 'approved';
    const styles = {
      approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      suspended: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
      needs_correction: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      draft: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
    };
    const labels = {
      approved: 'Approved',
      pending: 'Pending Review',
      rejected: 'Rejected',
      suspended: 'Suspended',
      needs_correction: 'Needs Correction',
      draft: 'Draft'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${styles[status as keyof typeof styles] || styles.suspended}`}>

        {labels[status as keyof typeof labels] || status}
      </span>;
  };
  const getTimeSinceFeedback = (createdAt: string) => {
    const now = new Date();
    const feedbackDate = new Date(createdAt);
    const diffMs = now.getTime() - feedbackDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  const handleSelectProperty = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredProperties.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const isValidPhone = (phone?: string) => {
    if (!phone) return false;
    const clean = phone.replace(/\D/g, '');
    return clean.length === 10;
  };

  const handleBulkWhatsApp = () => {
    const selected = filteredProperties.filter(p =>
      selectedIds.has(p.id)
    );

    const valid = selected.filter(p =>
      isValidPhone((p as any).owner?.phone)
    );

    if (valid.length === 0) {
      alert('No valid phone numbers found');
      return;
    }

    // Build queue of WhatsApp URLs
    const links = valid.map((property) => {
      const phone = (property as any).owner?.phone?.replace(/\D/g, '').slice(-10);
      const message = encodeURIComponent(
        `Hi ${(property as any).owner?.name || 'Owner'},\n\nYour property "${property.title}" is listed on Homilivo.\n\nPlease login and update details:\nhttps://homilivo.com`
      );
      const url = `https://wa.me/91${phone}?text=${message}`;
      return { url, property };
    });

    // Store queue and open first link
    setPendingWhatsAppLinks(links);
    setCurrentWhatsAppIndex(0);
    
    // Open first WhatsApp link
    window.open(links[0].url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenNextWhatsApp = () => {
    const nextIndex = currentWhatsAppIndex + 1;

    if (nextIndex < pendingWhatsAppLinks.length) {
      // Ask user to continue
      const currentProperty = pendingWhatsAppLinks[currentWhatsAppIndex].property;
      const nextProperty = pendingWhatsAppLinks[nextIndex].property;
      
      const continueNext = confirm(
        `Current: ${currentProperty.title}\n\nContinue to: ${nextProperty.title}?`
      );

      if (continueNext) {
        setCurrentWhatsAppIndex(nextIndex);
        window.open(pendingWhatsAppLinks[nextIndex].url, '_blank', 'noopener,noreferrer');
      }
    } else {
      // All done
      alert('All WhatsApp chats opened!');
      clearWhatsAppQueue();
    }
  };

  const handleSkipWhatsApp = () => {
    const nextIndex = currentWhatsAppIndex + 1;

    if (nextIndex < pendingWhatsAppLinks.length) {
      setCurrentWhatsAppIndex(nextIndex);
      
      // Ask if user wants to continue without opening this one
      const continueNext = confirm(
        `Skip to: ${pendingWhatsAppLinks[nextIndex].property.title}?`
      );

      if (continueNext) {
        window.open(pendingWhatsAppLinks[nextIndex].url, '_blank', 'noopener,noreferrer');
      }
    } else {
      // All done
      alert('All WhatsApp chats processed!');
      clearWhatsAppQueue();
    }
  };

  const clearWhatsAppQueue = async () => {
    // Track the contacted properties - async, non-blocking
    if (pendingWhatsAppLinks.length > 0) {
      const propertyIds = pendingWhatsAppLinks.map(link => link.property.id);
      try {
        await adminApi.trackContactAttempt(propertyIds);
        console.log(`Successfully tracked contact for ${propertyIds.length} properties`);
      } catch (error) {
        console.warn('Failed to track contact attempts:', error);
        // Don't show error to user - tracking is non-critical
      }
    }
    
    // Refresh properties to show updated tracking data
    dispatch(fetchAllProperties());
    
    // Clear UI state
    setPendingWhatsAppLinks([]);
    setCurrentWhatsAppIndex(0);
    setSelectedIds(new Set());
  };

  /**
   * PROMPT 3: Handle bulk follow-up WhatsApp with personalized messages
   */
  const handleFollowUpWhatsApp = () => {
    const selected = filteredProperties.filter(p =>
      followUpSelectedIds.has(p.id)
    );

    const valid = selected.filter(p =>
      isValidPhone((p as any).owner?.phone)
    );

    if (valid.length === 0) {
      alert('No valid phone numbers found');
      return;
    }

    // Build queue with personalized messages based on engagement status
    const links = valid.map((property) => {
      const phone = (property as any).owner?.phone?.replace(/\D/g, '').slice(-10);
      const engStatus = getEngagementStatus(property as any);
      const followUp = getFollowUpStatus(property as any);

      // Use message from follow-up status (PROMPT 3)
      let message = followUp.message;

      // Add owner name
      const fullMessage = `Hi ${(property as any).owner?.name || 'Owner'},\n\n${message}\n\nProperty: ${property.title}\n\nLogin here: https://homilivo.com`;

      const url = `https://wa.me/91${phone}?text=${encodeURIComponent(fullMessage)}`;
      return { url, property };
    });

    // Store queue and open first link
    setPendingWhatsAppLinks(links);
    setCurrentWhatsAppIndex(0);
    setShowFollowUpConfirm(false);
    
    // Open first WhatsApp link
    window.open(links[0].url, '_blank', 'noopener,noreferrer');
  };

  /**
   * PROMPT 3: Get properties that need follow-up
   */
  const getPropertiesNeedingFollowUp = () => {
    return filteredProperties.filter(prop => {
      const followUp = getFollowUpStatus(prop as any);
      return followUp.status !== 'NONE';
    });
  };
  return <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20 transition-colors duration-300">
      <RequestCorrectionModal isOpen={!!correctionProperty} onClose={() => setCorrectionProperty(null)} onConfirm={handleRequestCorrection} propertyTitle={correctionProperty?.title || ''} />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-playfair">
              Property Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Review and moderate property listings
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search properties..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy dark:text-white shadow-sm" />

            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto no-scrollbar">
            {['all', 'pending', 'needs_correction', 'approved', 'rejected', 'suspended'].map((status) => <button key={status} onClick={() => setFilterStatus(status)} className={`px-6 py-4 font-medium text-sm capitalize whitespace-nowrap transition-colors border-b-2 ${filterStatus === status ? 'border-navy dark:border-white text-navy dark:text-white bg-slate-50 dark:bg-slate-700/50' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>

                {status === 'needs_correction' ? 'Needs Correction' : status}
              </button>)}
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          {loading ? <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy dark:border-white mx-auto"></div>
            </div> : filteredProperties.length > 0 ? <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={
                          filteredProperties.length > 0 &&
                          selectedIds.size === filteredProperties.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 font-medium">Property</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Last Contacted</th>
                    <th className="px-6 py-4 font-medium">Attempts</th>
                    <th className="px-6 py-4 font-medium">Last Login</th>
                    <th className="px-6 py-4 font-medium">Last Updated</th>
                    <th className="px-6 py-4 font-medium">Engagement</th>
                    <th className="px-6 py-4 font-medium">Follow-up</th>
                    <th className="px-6 py-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredProperties.map((property) => {
                const status = property.reviewStatus || (property as any).status || 'approved';
                const hasFeedback = property.adminFeedback;
                return <tr key={property.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">

                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(property.id)}
                            onChange={(e) =>
                              handleSelectProperty(property.id, e.target.checked)
                            }
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={property.images[0]} alt="" loading="lazy" className="w-14 h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-700" />

                            <div>
                              <p className="font-bold text-navy dark:text-white line-clamp-1 max-w-[200px]">
                                {property.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {property.roomType} • {property.idealFor}
                              </p>
                              {hasFeedback && <div className="flex items-center gap-1 mt-1 text-xs text-orange-600 dark:text-orange-400">
                                  <Clock className="w-3 h-3" />
                                  Feedback sent{' '}
                                  {getTimeSinceFeedback(hasFeedback.createdAt)}
                                </div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="line-clamp-1 max-w-[150px]">
                              {property.location}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 font-medium text-navy dark:text-white">
                            <IndianRupee className="w-4 h-4" />
                            {property.pricePerMonth.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2 items-start">
                            {getStatusBadge(property)}
                            {hasFeedback && property.feedbackHistory && property.feedbackHistory.length > 1 && <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {property.feedbackHistory.length} feedback(s)
                                </span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span
                              title={getTimeTooltip(property.lastContactedAt)}
                              className="text-sm font-medium text-navy dark:text-white"
                            >
                              {getRelativeTime(property.lastContactedAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span
                              title={`${property.contactCount || 0} contact attempt(s)`}
                              className="text-sm font-medium text-navy dark:text-white bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full"
                            >
                              {property.contactCount || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span
                              title={getTimeTooltip((property as any).lastLoginAt)}
                              className="text-sm font-medium text-navy dark:text-white"
                            >
                              {getRelativeTime((property as any).lastLoginAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <TrendingUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span
                              title={getTimeTooltip((property as any).lastPropertyUpdateAt)}
                              className="text-sm font-medium text-navy dark:text-white"
                            >
                              {getRelativeTime((property as any).lastPropertyUpdateAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const engStatus = getEngagementStatus(property as any);
                            const badge = getEngagementBadge(engStatus);
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-flex items-center gap-1 ${badge.style}`}>
                                {badge.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const followUp = getFollowUpStatus(property as any);
                            const badge = getFollowUpBadge(followUp.status);
                            return (
                              <div className="flex flex-col items-start gap-1">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-flex items-center gap-1 ${badge.style}`}
                                  title={followUp.message}
                                >
                                  {badge.label}
                                </span>
                                {followUp.status !== 'NONE' && (
                                  <input
                                    type="checkbox"
                                    checked={followUpSelectedIds.has(property.id)}
                                    onChange={(e) => {
                                      const newSet = new Set(followUpSelectedIds);
                                      if (e.target.checked) {
                                        newSet.add(property.id);
                                      } else {
                                        newSet.delete(property.id);
                                      }
                                      setFollowUpSelectedIds(newSet);
                                    }}
                                    className="w-4 h-4 rounded cursor-pointer"
                                    title="Select for follow-up WhatsApp"
                                  />
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {status === 'pending' && <button onClick={() => setCorrectionProperty(property)} className="px-3 py-1.5 text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors whitespace-nowrap">

                                Request Correction
                              </button>}
                            <button onClick={() => navigate(`/admin/properties/${property.id}`)} className="px-3 py-1.5 text-xs font-medium text-navy dark:text-white bg-navy/5 dark:bg-white/10 hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy rounded-lg transition-colors whitespace-nowrap">

                              Manage
                            </button>
                          </div>
                        </td>
                      </tr>;
              })}
                </tbody>
              </table>
            </div> : <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
                No properties found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Try adjusting your filters or search terms
              </p>
            </div>}
        </div>

        {/* Bulk Actions Toolbar - Selection Mode */}
        {selectedIds.size > 0 && pendingWhatsAppLinks.length === 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center shadow-lg z-40">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Selected: {selectedIds.size} property
              {selectedIds.size !== 1 ? 'ies' : ''}
            </span>

            <div className="flex gap-2">
              <button
                onClick={handleBulkWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Send WhatsApp
              </button>

              <button
                onClick={() => setSelectedIds(new Set())}
                className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* PROMPT 3: Follow-up Actions Toolbar */}
        {(() => {
          const needsFollowUp = getPropertiesNeedingFollowUp();
          return followUpSelectedIds.size > 0 && pendingWhatsAppLinks.length === 0 ? (
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center shadow-lg z-40 translate-y-[calc(-100%*var(--follow-up-multiple,1))]" style={{ bottom: selectedIds.size > 0 ? '60px' : '0' }}>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selected for follow-up: {followUpSelectedIds.size} property
                {followUpSelectedIds.size !== 1 ? 'ies' : ''}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFollowUpConfirm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Follow-up
                </button>

                <button
                  onClick={() => setFollowUpSelectedIds(new Set())}
                  className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : null;
        })()}

        {/* WhatsApp Queue Toolbar - Sequential Mode */}
        {pendingWhatsAppLinks.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center shadow-lg z-40">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Opening: {currentWhatsAppIndex + 1} of {pendingWhatsAppLinks.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                {pendingWhatsAppLinks[currentWhatsAppIndex]?.property.title}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleOpenNextWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Next →
              </button>

              <button
                onClick={handleSkipWhatsApp}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Skip
              </button>

              <button
                onClick={clearWhatsAppQueue}
                className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* PROMPT 3: Follow-up Confirmation Modal */}
        {showFollowUpConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-navy dark:text-white">
                  Send Follow-up WhatsApp to {followUpSelectedIds.size} Owner{followUpSelectedIds.size !== 1 ? 's' : ''}?
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Personalized messages will be sent based on their engagement status
                </p>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {filteredProperties.map(prop => {
                  if (!followUpSelectedIds.has(prop.id)) return null;
                  const followUp = getFollowUpStatus(prop as any);
                  return (
                    <div key={prop.id} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{prop.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getFollowUpBadge(followUp.status).style}`}>
                          {getFollowUpBadge(followUp.status).label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Owner: {(prop as any).owner?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 italic">Message: {followUp.message}</p>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                <button
                  onClick={handleFollowUpWhatsApp}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send to All
                </button>
                <button
                  onClick={() => setShowFollowUpConfirm(false)}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>;
}