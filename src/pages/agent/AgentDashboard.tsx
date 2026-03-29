import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAssignedProperties, fetchAssignedTenants, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, createPropertyNote, updatePropertyNote, deletePropertyNote } from '../../store/slices/agent.slice';
import { Building, Users, Bell, MapPin, Calendar, Phone, Mail, CheckCircle, Clock, AlertCircle, RefreshCw, FileText, Plus, Edit2, Trash2 } from 'lucide-react';
import { PropertyNoteModal } from '../../components/agent/PropertyNoteModal';
import { DeleteNoteConfirmModal } from '../../components/agent/DeleteNoteConfirmModal';
import { AgentNote, AgentPropertyView } from '../../types/agent.types';
export function AgentDashboard() {
  const dispatch = useAppDispatch();
  const {
    user
  } = useAppSelector((state) => state.auth);
  const {
    properties,
    tenants,
    notifications,
    loading,
    error,
    unreadCount,
    myNotes
  } = useAppSelector((state) => state.agent);
  const [activeTab, setActiveTab] = useState<'properties' | 'tenants' | 'notifications'>('properties');
  // Note modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<AgentPropertyView | null>(null);
  const [selectedNote, setSelectedNote] = useState<AgentNote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    dispatch(fetchAssignedProperties());
    dispatch(fetchAssignedTenants());
    dispatch(fetchNotifications({
      page: 1
    }));
  }, [dispatch]);
  const handleRefresh = () => {
    switch (activeTab) {
      case 'properties':
        dispatch(fetchAssignedProperties());
        break;
      case 'tenants':
        dispatch(fetchAssignedTenants());
        break;
      case 'notifications':
        dispatch(fetchNotifications({
          page: 1
        }));
        break;
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // Note handlers
  const handleOpenCreateNote = (property: AgentPropertyView) => {
    setSelectedProperty(property);
    setSelectedNote(null);
    setNoteModalOpen(true);
  };
  const handleOpenEditNote = (property: AgentPropertyView, note: AgentNote) => {
    setSelectedProperty(property);
    setSelectedNote(note);
    setNoteModalOpen(true);
  };
  const handleOpenDeleteNote = (property: AgentPropertyView, note: AgentNote) => {
    setSelectedProperty(property);
    setSelectedNote(note);
    setDeleteModalOpen(true);
  };
  const handleSaveNote = async (content: string) => {
    if (!selectedProperty) return;
    setIsSubmitting(true);
    try {
      if (selectedNote) {
        // Edit existing note
        await dispatch(updatePropertyNote({
          noteId: selectedNote.id,
          propertyId: selectedProperty.id,
          content
        })).unwrap();
      } else {
        // Create new note
        await dispatch(createPropertyNote({
          propertyId: selectedProperty.id,
          content
        })).unwrap();
      }
      setNoteModalOpen(false);
      setSelectedProperty(null);
      setSelectedNote(null);
    } catch (error) {


      // Error handled by thunk/toast
    } finally {setIsSubmitting(false);
    }
  };
  const handleDeleteNote = async () => {
    if (!selectedProperty || !selectedNote) return;
    setIsSubmitting(true);
    try {
      await dispatch(deletePropertyNote({
        noteId: selectedNote.id,
        propertyId: selectedProperty.id
      })).unwrap();
      setDeleteModalOpen(false);
      setSelectedProperty(null);
      setSelectedNote(null);
    } catch (error) {


      // Error handled by thunk/toast
    } finally {setIsSubmitting(false);
    }
  };
  // Get notes for a specific property
  const getPropertyNotes = (propertyId: string): AgentNote[] => {
    return myNotes[propertyId] || [];
  };
  return <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20 pb-12 transition-colors duration-300">
      {/* Note Modals */}
      <PropertyNoteModal isOpen={noteModalOpen} onClose={() => {
      setNoteModalOpen(false);
      setSelectedProperty(null);
      setSelectedNote(null);
    }} onSave={handleSaveNote} propertyTitle={selectedProperty?.title || ''} existingNote={selectedNote} isSubmitting={isSubmitting} />


      <DeleteNoteConfirmModal isOpen={deleteModalOpen} onClose={() => {
      setDeleteModalOpen(false);
      setSelectedProperty(null);
      setSelectedNote(null);
    }} onConfirm={handleDeleteNote} propertyTitle={selectedProperty?.title || ''} isSubmitting={isSubmitting} />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-playfair">
            Agent Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Welcome back, {user?.name}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div onClick={() => setActiveTab('properties')} className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border cursor-pointer transition-all duration-200 ${activeTab === 'properties' ? 'border-navy dark:border-white ring-2 ring-navy/10 dark:ring-white/10' : 'border-slate-100 dark:border-slate-700 hover:border-navy/30 dark:hover:border-white/30'}`}>

            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Building className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-navy dark:text-white">
                {properties.length}
              </span>
            </div>
            <h3 className="font-medium text-slate-700 dark:text-slate-300">
              Assigned Properties
            </h3>
          </div>

          <div onClick={() => setActiveTab('tenants')} className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border cursor-pointer transition-all duration-200 ${activeTab === 'tenants' ? 'border-navy dark:border-white ring-2 ring-navy/10 dark:ring-white/10' : 'border-slate-100 dark:border-slate-700 hover:border-navy/30 dark:hover:border-white/30'}`}>

            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-navy dark:text-white">
                {tenants.length}
              </span>
            </div>
            <h3 className="font-medium text-slate-700 dark:text-slate-300">
              Assigned Tenants
            </h3>
          </div>

          <div onClick={() => setActiveTab('notifications')} className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border cursor-pointer transition-all duration-200 ${activeTab === 'notifications' ? 'border-navy dark:border-white ring-2 ring-navy/10 dark:ring-white/10' : 'border-slate-100 dark:border-slate-700 hover:border-navy/30 dark:hover:border-white/30'}`}>

            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                <Bell className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-navy dark:text-white">
                {unreadCount}
              </span>
            </div>
            <h3 className="font-medium text-slate-700 dark:text-slate-300">
              Unread Notifications
            </h3>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          {/* Tabs Header */}
          <div className="border-b border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy dark:text-white">
              {activeTab === 'properties' && 'My Properties'}
              {activeTab === 'tenants' && 'My Tenants'}
              {activeTab === 'notifications' && 'Notifications'}
            </h2>
            <button onClick={handleRefresh} className="p-2 text-slate-400 hover:text-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors" title="Refresh">

              <RefreshCw className={`w-5 h-5 ${loading[activeTab] ? 'animate-spin' : ''}`} />

            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error State */}
            {error[activeTab] && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p>{error[activeTab]}</p>
                <button onClick={handleRefresh} className="ml-auto text-sm font-medium underline hover:text-red-700 dark:hover:text-red-300">

                  Retry
                </button>
              </div>}

            {/* Loading State */}
            {loading[activeTab] && !error[activeTab] && properties.length === 0 && tenants.length === 0 && notifications.length === 0 ? <div className="space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-50 dark:bg-slate-700 rounded-lg animate-pulse" />)}
              </div> : <>
                {/* Properties Tab */}
                {activeTab === 'properties' && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {properties.length === 0 ? <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                        <Building className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No properties assigned yet.</p>
                      </div> : properties.map((property) => {
                const propertyNotes = getPropertyNotes(property.id);
                return <div key={property.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-5 hover:shadow-md transition-shadow">

                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-navy dark:text-white text-lg mb-1">
                                  {property.title}
                                </h3>
                                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {property.location}, {property.city}
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${property.isActive ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>

                                {property.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 mb-4">
                              <div className="flex items-center justify-between">
                                <span>Price:</span>
                                <span className="font-medium text-navy dark:text-white">
                                  ₹{property.pricePerMonth.toLocaleString()}/mo
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Type:</span>
                                <span className="font-medium text-navy dark:text-white">
                                  {property.roomType}
                                </span>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Owner Details
                              </p>
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-navy dark:text-white">
                                  {property.owner.name}
                                </span>
                                <div className="flex gap-2">
                                  {property.owner.phone && <a href={`tel:${property.owner.phone}`} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full" title="Call Owner">

                                      <Phone className="w-4 h-4" />
                                    </a>}
                                  <a href={`mailto:${property.owner.email}`} className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full" title="Email Owner">

                                    <Mail className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            </div>

                            {property.assignment.assignmentNotes && <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-xs text-yellow-800 dark:text-yellow-400">
                                <span className="font-bold">
                                  Assignment Note:
                                </span>{' '}
                                {property.assignment.assignmentNotes}
                              </div>}

                            {/* Agent's Notes Section */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  My Notes
                                </p>
                                <button onClick={() => handleOpenCreateNote(property)} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1" disabled={loading.notes}>

                                  <Plus className="w-3 h-3" />
                                  Add Note
                                </button>
                              </div>

                              {propertyNotes.length > 0 ? <div className="space-y-2">
                                  {propertyNotes.map((note) => <div key={note.id} className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-3 group">

                                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 whitespace-pre-wrap">
                                        {note.content}
                                      </p>
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                          {formatDate(note.createdAt)}
                                          {note.updatedAt !== note.createdAt && ' (edited)'}
                                        </span>
                                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => handleOpenEditNote(property, note)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors" title="Edit Note" disabled={loading.notes}>

                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => handleOpenDeleteNote(property, note)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete Note" disabled={loading.notes}>

                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>)}
                                </div> : <p className="text-xs text-slate-400 italic">
                                  No notes yet. Add a note for the owner/tenant
                                  to see.
                                </p>}
                            </div>
                          </div>;
              })}
                  </div>}

                {/* Tenants Tab */}
                {activeTab === 'tenants' && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tenants.length === 0 ? <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No tenants assigned yet.</p>
                      </div> : tenants.map((tenant) => <div key={tenant.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-5 hover:shadow-md transition-shadow">

                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-navy dark:text-white text-lg mb-1">
                                {tenant.name}
                              </h3>
                              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                                <MapPin className="w-4 h-4 mr-1" />
                                {tenant.city || 'No city specified'}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">
                              Assigned{' '}
                              {formatDate(tenant.assignment.assignedAt)}
                            </span>
                          </div>

                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <a href={`mailto:${tenant.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">

                                {tenant.email}
                              </a>
                            </div>
                            {tenant.phone && <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <a href={`tel:${tenant.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">

                                  {tenant.phone}
                                </a>
                              </div>}
                          </div>

                          {tenant.assignment.reason && <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded text-sm text-slate-600 dark:text-slate-300">
                              <span className="font-medium text-navy dark:text-white">
                                Assignment Reason:
                              </span>{' '}
                              {tenant.assignment.reason}
                            </div>}
                        </div>)}
                  </div>}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && <div className="space-y-4">
                    <div className="flex justify-end mb-4">
                      <button onClick={() => dispatch(markAllNotificationsAsRead())} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium" disabled={unreadCount === 0}>

                        Mark all as read
                      </button>
                    </div>

                    {notifications.length === 0 ? <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No notifications yet.</p>
                      </div> : notifications.map((notification) => <div key={notification.id} className={`p-4 rounded-lg border transition-colors ${notification.isRead ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700' : 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800'}`} onClick={() => !notification.isRead && dispatch(markNotificationAsRead(notification.id))}>

                          <div className="flex gap-4">
                            <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>

                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-medium ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-navy dark:text-white'}`}>

                                  {notification.title}
                                </h4>
                                <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                  {formatDate(notification.createdAt)} •{' '}
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                {notification.message}
                              </p>

                              {/* Contextual Payload Info */}
                              {notification.payload && <div className="text-xs text-slate-500 dark:text-slate-400 flex gap-4 mt-2">
                                  {notification.payload.propertyTitle && <span className="flex items-center gap-1">
                                      <Building className="w-3 h-3" />
                                      {notification.payload.propertyTitle}
                                    </span>}
                                  {notification.payload.tenantName && <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {notification.payload.tenantName}
                                    </span>}
                                </div>}
                            </div>
                            {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
                          </div>
                        </div>)}
                  </div>}
              </>}
          </div>
        </div>
      </div>
    </div>;
}