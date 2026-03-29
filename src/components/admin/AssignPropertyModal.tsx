import React, { useEffect, useState } from 'react';
import { X, Search, Home, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllProperties } from '../../store/slices/admin.slice';
interface AssignPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (propertyId: string, notes?: string) => void;
  agentName: string;
  isSubmitting?: boolean;
}
export function AssignPropertyModal({
  isOpen,
  onClose,
  onConfirm,
  agentName,
  isSubmitting = false
}: AssignPropertyModalProps) {
  const dispatch = useAppDispatch();
  const {
    properties,
    loading
  } = useAppSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllProperties({}));
      setSearchTerm('');
      setSelectedPropertyId(null);
      setNotes('');
    }
  }, [isOpen, dispatch]);
  if (!isOpen) return null;
  const filteredProperties = properties.filter((p) => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.city.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-navy dark:text-white font-playfair">
              Assign Property
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Assigning to {agentName}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">

            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search properties by title or city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy dark:text-white" />

          </div>

          {/* Property List */}
          <div className="flex-1 overflow-y-auto border border-slate-100 dark:border-slate-700 rounded-lg mb-4">
            {loading ? <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy dark:border-white mx-auto"></div>
              </div> : filteredProperties.length > 0 ? <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredProperties.map((property) => <div key={property.id} onClick={() => setSelectedPropertyId(property.id)} className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${selectedPropertyId === property.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700 border-l-4 border-transparent'}`}>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-navy dark:text-white">
                          {property.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {property.city} • {property.location}
                        </p>
                      </div>
                    </div>
                    {selectedPropertyId === property.id && <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  </div>)}
              </div> : <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No properties found matching your search.
              </div>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Assignment Notes (Optional)
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none h-20 resize-none dark:bg-slate-700 dark:text-white" placeholder="Add any specific instructions or notes..." />

          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors" disabled={isSubmitting}>

            Cancel
          </button>
          <button onClick={() => selectedPropertyId && onConfirm(selectedPropertyId, notes)} disabled={!selectedPropertyId || isSubmitting} className="px-6 py-2 bg-navy dark:bg-slate-200 text-white dark:text-navy font-medium rounded-lg hover:bg-navy/90 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">

            {isSubmitting ? <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Assigning...
              </> : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>;
}