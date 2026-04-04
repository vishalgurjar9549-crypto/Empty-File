import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAssignedProperties, fetchAssignedTenants, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, createPropertyNote, updatePropertyNote, deletePropertyNote } from '../../store/slices/agent.slice';
import { Building, Users, Bell, MapPin, Calendar, Phone, Mail, CheckCircle, Clock, AlertCircle, RefreshCw, FileText, Plus, Edit2, Trash2 } from 'lucide-react';
import { PropertyNoteModal } from '../../components/agent/PropertyNoteModal';
import { DeleteNoteConfirmModal } from '../../components/agent/DeleteNoteConfirmModal';
import { AgentNote, AgentPropertyView } from '../../types/agent.types';
export function AgentDashboard() {
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const {
    properties = [],
    tenants = [],
    notifications = [],
    loading,
    error,
    unreadCount = 0,
    myNotes = {},
  } = useAppSelector((state) => state.agent);

  const [activeTab, setActiveTab] = useState<DashboardTab>('properties');

  // Note modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<AgentPropertyView | null>(null);
  const [selectedNote, setSelectedNote] = useState<AgentNote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignedProperties());
    dispatch(fetchAssignedTenants());
    dispatch(fetchNotifications({ page: 1 }));
  }, [dispatch]);

  const currentLoading = loading?.[activeTab];
  const currentError = error?.[activeTab];

  const stats = useMemo(
    () => [
      {
        key: 'properties' as DashboardTab,
        label: 'Assigned Properties',
        count: properties.length,
        icon: Building,
        iconClass: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      },
      {
        key: 'tenants' as DashboardTab,
        label: 'Assigned Tenants',
        count: tenants.length,
        icon: Users,
        iconClass:
          'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      },
      {
        key: 'notifications' as DashboardTab,
        label: 'Unread Notifications',
        count: unreadCount,
        icon: Bell,
        iconClass:
          'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      },
    ],
    [properties.length, tenants.length, unreadCount]
  );

  const handleRefresh = () => {
    switch (activeTab) {
      case 'properties':
        dispatch(fetchAssignedProperties());
        break;
      case 'tenants':
        dispatch(fetchAssignedTenants());
        break;
      case 'notifications':
        dispatch(fetchNotifications({ page: 1 }));
        break;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPropertyNotes = (propertyId: string): AgentNote[] => {
    return myNotes?.[propertyId] || [];
  };

  // ---------------------------
  // Note Handlers
  // ---------------------------
  const resetNoteState = () => {
    setSelectedProperty(null);
    setSelectedNote(null);
    setNoteModalOpen(false);
    setDeleteModalOpen(false);
  };

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
        await dispatch(
          updatePropertyNote({
            noteId: selectedNote.id,
            propertyId: selectedProperty.id,
            content,
          })
        ).unwrap();
      } else {
        await dispatch(
          createPropertyNote({
            propertyId: selectedProperty.id,
            content,
          })
        ).unwrap();
      }

      resetNoteState();
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedProperty || !selectedNote) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        deletePropertyNote({
          noteId: selectedNote.id,
          propertyId: selectedProperty.id,
        })
      ).unwrap();

      resetNoteState();
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20 pb-12 transition-colors duration-300">
      {/* Modals */}
      <PropertyNoteModal
        isOpen={noteModalOpen}
        onClose={resetNoteState}
        onSave={handleSaveNote}
        propertyTitle={selectedProperty?.title || ''}
        existingNote={selectedNote}
        isSubmitting={isSubmitting}
      />

      <DeleteNoteConfirmModal
        isOpen={deleteModalOpen}
        onClose={resetNoteState}
        onConfirm={handleDeleteNote}
        propertyTitle={selectedProperty?.title || ''}
        isSubmitting={isSubmitting}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-playfair">
            Agent Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Welcome back, {user?.name || 'Agent'}
          </p>
        </header>

        {/* Stats */}
        <StatsCards stats={stats} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Panel */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <DashboardPanelHeader
            activeTab={activeTab}
            loading={currentLoading}
            onRefresh={handleRefresh}
          />

          <div className="p-4 sm:p-6">
            {currentError && (
              <ErrorBanner message={currentError} onRetry={handleRefresh} />
            )}

            {currentLoading ? (
              <DashboardLoadingState activeTab={activeTab} />
            ) : (
              <>
                {activeTab === 'properties' && (
                  <PropertiesTab
                    properties={properties}
                    getPropertyNotes={getPropertyNotes}
                    onCreateNote={handleOpenCreateNote}
                    onEditNote={handleOpenEditNote}
                    onDeleteNote={handleOpenDeleteNote}
                    formatDate={formatDate}
                    notesLoading={loading?.notes}
                  />
                )}

                {activeTab === 'tenants' && (
                  <TenantsTab tenants={tenants} formatDate={formatDate} />
                )}

                {activeTab === 'notifications' && (
                  <NotificationsTab
                    notifications={notifications}
                    unreadCount={unreadCount}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    onMarkAllRead={() => dispatch(markAllNotificationsAsRead())}
                    onMarkRead={(id: string) => dispatch(markNotificationAsRead(id))}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   SUBCOMPONENTS
========================================================= */

function StatsCards({
  stats,
  activeTab,
  onTabChange,
}: {
  stats: {
    key: DashboardTab;
    label: string;
    count: number;
    icon: React.ElementType;
    iconClass: string;
  }[];
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {stats.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onTabChange(item.key)}
            className={`text-left bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm border transition-all duration-200 min-h-[120px]
              ${
                isActive
                  ? 'border-navy dark:border-white ring-2 ring-navy/10 dark:ring-white/10'
                  : 'border-slate-100 dark:border-slate-700 hover:border-navy/30 dark:hover:border-white/30'
              }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${item.iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-navy dark:text-white">
                {item.count}
              </span>
            </div>
            <h3 className="font-medium text-slate-700 dark:text-slate-300">
              {item.label}
            </h3>
          </button>
        );
      })}
    </div>
  );
}

function DashboardPanelHeader({
  activeTab,
  loading,
  onRefresh,
}: {
  activeTab: DashboardTab;
  loading?: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-700 px-4 sm:px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg sm:text-xl font-bold text-navy dark:text-white">
        {activeTab === 'properties' && 'My Properties'}
        {activeTab === 'tenants' && 'My Tenants'}
        {activeTab === 'notifications' && 'Notifications'}
      </h2>

      <button
        onClick={onRefresh}
        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-navy dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
        title="Refresh"
        aria-label="Refresh current tab"
      >
        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
      <p className="text-sm sm:text-base">{message}</p>
      <button
        onClick={onRetry}
        className="ml-auto text-sm font-medium underline hover:text-red-700 dark:hover:text-red-300"
      >
        Retry
      </button>
    </div>
  );
}

function DashboardLoadingState({ activeTab }: { activeTab: DashboardTab }) {
  if (activeTab === 'notifications') {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  return <GridSkeleton cols={2} count={2} />;
}

/* =========================================================
   PROPERTIES TAB
========================================================= */

function PropertiesTab({
  properties,
  getPropertyNotes,
  onCreateNote,
  onEditNote,
  onDeleteNote,
  formatDate,
  notesLoading,
}: {
  properties: AgentPropertyView[];
  getPropertyNotes: (propertyId: string) => AgentNote[];
  onCreateNote: (property: AgentPropertyView) => void;
  onEditNote: (property: AgentPropertyView, note: AgentNote) => void;
  onDeleteNote: (property: AgentPropertyView, note: AgentNote) => void;
  formatDate: (date?: string) => string;
  notesLoading?: boolean;
}) {
  if (!properties.length) {
    return (
      <EmptyState
        icon={Building}
        title="No Properties Assigned"
        description="You don't have any properties assigned yet. Check back soon or contact your supervisor."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
      {properties.map((property) => {
        const propertyNotes = getPropertyNotes(property.id);

        return (
          <div
            key={property.id}
            className="border border-slate-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="font-bold text-navy dark:text-white text-lg mb-1 truncate">
                  {property.title}
                </h3>

                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                  <MapPin className="w-4 h-4 mr-1 shrink-0" />
                  <span className="truncate">
                    {property.location}, {property.city}
                  </span>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium self-start ${
                  property.isActive
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {property.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 mb-4">
              <InfoRow
                label="Price"
                value={`₹${property.pricePerMonth?.toLocaleString?.() || 0}/mo`}
              />
              <InfoRow label="Type" value={property.roomType || 'N/A'} />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Owner Details
              </p>

              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-navy dark:text-white truncate">
                  {property.owner?.name || 'Owner'}
                </span>

                <div className="flex gap-2 shrink-0">
                  {property.owner?.phone && (
                    <a
                      href={`tel:${property.owner.phone}`}
                      className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                      title="Call Owner"
                      aria-label={`Call ${property.owner.name}`}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}

                  {property.owner?.email && (
                    <a
                      href={`mailto:${property.owner.email}`}
                      className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                      title="Email Owner"
                      aria-label={`Email ${property.owner.name}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {property.assignment?.assignmentNotes && (
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl text-xs text-yellow-800 dark:text-yellow-400">
                <span className="font-bold">Assignment Note:</span>{' '}
                {property.assignment.assignmentNotes}
              </div>
            )}

            <AgentNotesSection
              property={property}
              notes={propertyNotes}
              formatDate={formatDate}
              notesLoading={notesLoading}
              onCreateNote={onCreateNote}
              onEditNote={onEditNote}
              onDeleteNote={onDeleteNote}
            />
          </div>
        );
      })}
    </div>
  );
}

function AgentNotesSection({
  property,
  notes,
  formatDate,
  notesLoading,
  onCreateNote,
  onEditNote,
  onDeleteNote,
}: {
  property: AgentPropertyView;
  notes: AgentNote[];
  formatDate: (date?: string) => string;
  notesLoading?: boolean;
  onCreateNote: (property: AgentPropertyView) => void;
  onEditNote: (property: AgentPropertyView, note: AgentNote) => void;
  onDeleteNote: (property: AgentPropertyView, note: AgentNote) => void;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <FileText className="w-3 h-3" />
          My Notes
        </p>

        <button
          onClick={() => onCreateNote(property)}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 min-h-[44px]"
          disabled={notesLoading}
        >
          <Plus className="w-3 h-3" />
          Add Note
        </button>
      </div>

      {notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-3 group"
            >
              <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 whitespace-pre-wrap break-words">
                {note.content}
              </p>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  {formatDate(note.createdAt)}
                  {note.updatedAt !== note.createdAt && ' (edited)'}
                </span>

                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditNote(property, note)}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit Note"
                    aria-label="Edit note"
                    disabled={notesLoading}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteNote(property, note)}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Note"
                    aria-label="Delete note"
                    disabled={notesLoading}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">
          No notes yet. Add a note for the owner/tenant to see.
        </p>
      )}
    </div>
  );
}

/* =========================================================
   TENANTS TAB
========================================================= */

function TenantsTab({
  tenants,
  formatDate,
}: {
  tenants: any[];
  formatDate: (date?: string) => string;
}) {
  if (!tenants.length) {
    return (
      <EmptyState
        icon={Users}
        title="No Tenants Assigned"
        description="You don't have any tenants assigned yet. They will appear here once you're assigned."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
      {tenants.map((tenant) => (
        <div
          key={tenant.id}
          className="border border-slate-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <div className="min-w-0">
              <h3 className="font-bold text-navy dark:text-white text-lg mb-1 truncate">
                {tenant.name}
              </h3>

              <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm">
                <MapPin className="w-4 h-4 mr-1 shrink-0" />
                <span className="truncate">{tenant.city || 'No city specified'}</span>
              </div>
            </div>

            <span className="text-xs text-slate-400 shrink-0">
              Assigned {formatDate(tenant.assignment?.assignedAt)}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            {tenant.email && (
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`mailto:${tenant.email}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 break-all"
                >
                  {tenant.email}
                </a>
              </div>
            )}

            {tenant.phone && (
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href={`tel:${tenant.phone}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {tenant.phone}
                </a>
              </div>
            )}
          </div>

          {tenant.assignment?.reason && (
            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium text-navy dark:text-white">
                Assignment Reason:
              </span>{' '}
              {tenant.assignment.reason}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS TAB
========================================================= */

function NotificationsTab({
  notifications,
  unreadCount,
  formatDate,
  formatTime,
  onMarkAllRead,
  onMarkRead,
}: {
  notifications: any[];
  unreadCount: number;
  formatDate: (date?: string) => string;
  formatTime: (date?: string) => string;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={onMarkAllRead}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You're all caught up! Notifications will appear here."
        />
      ) : (
        notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => !notification.isRead && onMarkRead(notification.id)}
            className={`w-full text-left p-4 rounded-2xl border transition-colors ${
              notification.isRead
                ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                : 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800'
            }`}
          >
            <div className="flex gap-4">
              <div
                className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                  notification.isRead
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                  <h4
                    className={`font-medium ${
                      notification.isRead
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-navy dark:text-white'
                    }`}
                  >
                    {notification.title}
                  </h4>

                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(notification.createdAt)} •{' '}
                    {formatTime(notification.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  {notification.message}
                </p>

                {notification.payload && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-4 mt-2">
                    {notification.payload.propertyTitle && (
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {notification.payload.propertyTitle}
                      </span>
                    )}

                    {notification.payload.tenantName && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {notification.payload.tenantName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              )}
            </div>
          </button>
        ))
      )}
    </div>
  );
}

/* =========================================================
   SMALL UI HELPERS
========================================================= */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}:</span>
      <span className="font-medium text-navy dark:text-white text-right">{value}</span>
    </div>
  );
}