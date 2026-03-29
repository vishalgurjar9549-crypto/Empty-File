import React, { useEffect, useState, lazy } from 'react';
import { Search, MapPin, IndianRupee, Home, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllProperties, requestPropertyCorrection } from '../../store/slices/admin.slice';
import { RequestCorrectionModal } from '../../components/admin/RequestCorrectionModal';
import { Room, FeedbackReason, FeedbackSeverity } from '../../types/api.types';
import { useNavigate } from 'react-router-dom';
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
                    <th className="px-6 py-4 font-medium">Property</th>
                    <th className="px-6 py-4 font-medium">Location</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Status</th>
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
      </div>
    </div>;
}