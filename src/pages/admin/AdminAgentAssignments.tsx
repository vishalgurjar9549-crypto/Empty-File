import React, { useEffect, useMemo, useState } from 'react';
import { Users, Home, UserCheck, ChevronDown, ChevronUp, Calendar, CheckCircle, XCircle, AlertCircle, RefreshCw, Search, Mail, Phone, Plus, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPropertyAssignments, fetchTenantAssignments, assignPropertyToAgent, unassignPropertyFromAgent, assignTenantToAgent, unassignTenantFromAgent } from '../../store/slices/admin.slice';
import { PropertyAssignment, TenantAssignment } from '../../types/admin.types';
import { AssignPropertyModal } from '../../components/admin/AssignPropertyModal';
import { AssignTenantModal } from '../../components/admin/AssignTenantModal';
import { UnassignConfirmationModal } from '../../components/admin/UnassignConfirmationModal';
// Helper to group assignments by agent
interface AgentGroup {
  agentId: string;
  agentName: string;
  agentEmail: string;
  properties: PropertyAssignment[];
  tenants: TenantAssignment[];
}
export function AdminAgentAssignments() {
  const dispatch = useAppDispatch();
  const {
    propertyAssignments,
    tenantAssignments,
    assignmentsLoading,
    assignmentsError
  } = useAppSelector((state) => state.admin);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  // Modal States
  const [activeAgent, setActiveAgent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isAssignPropertyOpen, setIsAssignPropertyOpen] = useState(false);
  const [isAssignTenantOpen, setIsAssignTenantOpen] = useState(false);
  const [unassignTarget, setUnassignTarget] = useState<{
    type: 'property' | 'tenant';
    agentId: string;
    itemId: string;
    itemName: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchPropertyAssignments({}));
    dispatch(fetchTenantAssignments({}));
  }, [dispatch]);
  // Handle retry
  const handleRetry = () => {
    dispatch(fetchPropertyAssignments({}));
    dispatch(fetchTenantAssignments({}));
  };
  // Toggle agent expansion
  const toggleAgent = (agentId: string) => {
    const newExpanded = new Set(expandedAgents);
    if (newExpanded.has(agentId)) {
      newExpanded.delete(agentId);
    } else {
      newExpanded.add(agentId);
    }
    setExpandedAgents(newExpanded);
  };
  // Process and group data
  const agentGroups = useMemo(() => {
    const groups: Record<string, AgentGroup> = {};
    // Process properties
    propertyAssignments.forEach((assignment) => {
      if (showActiveOnly && !assignment.isActive) return;
      if (!groups[assignment.agentId]) {
        groups[assignment.agentId] = {
          agentId: assignment.agentId,
          agentName: assignment.agent.name,
          agentEmail: assignment.agent.email,
          properties: [],
          tenants: []
        };
      }
      groups[assignment.agentId].properties.push(assignment);
    });
    // Process tenants
    tenantAssignments.forEach((assignment) => {
      if (showActiveOnly && !assignment.isActive) return;
      if (!groups[assignment.agentId]) {
        groups[assignment.agentId] = {
          agentId: assignment.agentId,
          agentName: assignment.agent.name,
          agentEmail: assignment.agent.email,
          properties: [],
          tenants: []
        };
      }
      groups[assignment.agentId].tenants.push(assignment);
    });
    // Convert to array and filter by search
    return Object.values(groups).filter((group) => group.agentName.toLowerCase().includes(searchTerm.toLowerCase()) || group.agentEmail.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => a.agentName.localeCompare(b.agentName));
  }, [propertyAssignments, tenantAssignments, showActiveOnly, searchTerm]);
  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalAgents: agentGroups.length,
      totalProperties: propertyAssignments.filter((a) => !showActiveOnly || a.isActive).length,
      totalTenants: tenantAssignments.filter((a) => !showActiveOnly || a.isActive).length
    };
  }, [agentGroups, propertyAssignments, tenantAssignments, showActiveOnly]);
  // Handlers
  const handleAssignProperty = async (propertyId: string, notes?: string) => {
    if (!activeAgent) return;
    setIsSubmitting(true);
    try {
      await dispatch(assignPropertyToAgent({
        agentId: activeAgent.id,
        propertyId,
        notes
      })).unwrap();
      setIsAssignPropertyOpen(false);
    } catch (error) {


      // Error handled by thunk/toast
    } finally {setIsSubmitting(false);
    }
  };
  const handleAssignTenant = async (tenantId: string, reason?: string) => {
    if (!activeAgent) return;
    setIsSubmitting(true);
    try {
      await dispatch(assignTenantToAgent({
        agentId: activeAgent.id,
        tenantId,
        reason
      })).unwrap();
      setIsAssignTenantOpen(false);
    } catch (error) {


      // Error handled by thunk/toast
    } finally {setIsSubmitting(false);
    }
  };
  const handleUnassign = async () => {
    if (!unassignTarget) return;
    setIsSubmitting(true);
    try {
      if (unassignTarget.type === 'property') {
        await dispatch(unassignPropertyFromAgent({
          agentId: unassignTarget.agentId,
          propertyId: unassignTarget.itemId
        })).unwrap();
      } else {
        await dispatch(unassignTenantFromAgent({
          agentId: unassignTarget.agentId,
          tenantId: unassignTarget.itemId
        })).unwrap();
      }
      setUnassignTarget(null);
    } catch (error) {


      // Error handled by thunk/toast
    } finally {setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20 transition-colors duration-300">
      {/* Modals */}
      {activeAgent && <>
          <AssignPropertyModal isOpen={isAssignPropertyOpen} onClose={() => setIsAssignPropertyOpen(false)} onConfirm={handleAssignProperty} agentName={activeAgent.name} isSubmitting={isSubmitting} />


          <AssignTenantModal isOpen={isAssignTenantOpen} onClose={() => setIsAssignTenantOpen(false)} onConfirm={handleAssignTenant} agentName={activeAgent.name} isSubmitting={isSubmitting} />

        </>}

      <UnassignConfirmationModal isOpen={!!unassignTarget} onClose={() => setUnassignTarget(null)} onConfirm={handleUnassign} title={unassignTarget?.type === 'property' ? 'Unassign Property' : 'Unassign Tenant'} message={`Are you sure you want to remove the assignment for ${unassignTarget?.itemName}? This action cannot be undone.`} itemName={unassignTarget?.itemName || ''} isSubmitting={isSubmitting} />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-playfair">
            Agent Assignments
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overview of property and tenant assignments
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {stats.totalAgents}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Active Agents
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {stats.totalProperties}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Property Assignments
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy dark:text-white">
                {stats.totalTenants}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tenant Assignments
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search agents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy dark:text-white" />

          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={showActiveOnly} onChange={() => setShowActiveOnly(!showActiveOnly)} />


              <div className={`w-10 h-6 rounded-full transition-colors ${showActiveOnly ? 'bg-navy' : 'bg-slate-300 dark:bg-slate-600'}`}>
              </div>
              <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${showActiveOnly ? 'translate-x-4' : ''}`}>
              </div>
            </div>
            <span className="text-sm font-medium text-navy dark:text-white">
              Show active only
            </span>
          </label>
        </div>

        {/* Content */}
        {assignmentsLoading && agentGroups.length === 0 ? <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy dark:border-white mx-auto"></div>
            <p className="text-slate-500 dark:text-slate-400 mt-4">
              Loading assignments...
            </p>
          </div> : assignmentsError ? <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-red-100 dark:border-red-800">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-navy dark:text-white mb-2">
              Failed to load assignments
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {assignmentsError}
            </p>
            <button onClick={handleRetry} className="inline-flex items-center gap-2 px-4 py-2 bg-navy dark:bg-slate-200 text-white dark:text-navy rounded-lg hover:bg-navy/90 dark:hover:bg-white transition-colors">

              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div> : agentGroups.length === 0 ? <div className="p-16 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
              No assignments found
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchTerm ? 'Try adjusting your search terms' : 'No agents have been assigned properties or tenants yet'}
            </p>
          </div> : <div className="space-y-4">
            {agentGroups.map((group) => <div key={group.agentId} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">

                {/* Agent Header Card */}
                <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" onClick={() => toggleAgent(group.agentId)}>

                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-navy/5 dark:bg-white/10 flex items-center justify-center text-navy dark:text-white font-bold text-lg flex-shrink-0">
                      {group.agentName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-navy dark:text-white text-lg truncate">
                        {group.agentName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 min-w-0">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{group.agentEmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="hidden sm:flex gap-3">
                      <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                        {group.properties.length} Properties
                      </span>
                      <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                        {group.tenants.length} Tenants
                      </span>
                    </div>
                    <div className="flex sm:hidden gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>{group.properties.length}P</span>
                      <span>·</span>
                      <span>{group.tenants.length}T</span>
                    </div>
                    {expandedAgents.has(group.agentId) ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedAgents.has(group.agentId) && <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-6 space-y-8">
                    {/* Properties Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          Assigned Properties
                        </h4>
                        <button onClick={() => {
                  setActiveAgent({
                    id: group.agentId,
                    name: group.agentName
                  });
                  setIsAssignPropertyOpen(true);
                }} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">

                          <Plus className="w-4 h-4" /> Assign Property
                        </button>
                      </div>

                      {group.properties.length > 0 ? <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
                          <table className="w-full text-left text-sm min-w-[560px]">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                              <tr>
                                <th className="p-4">Property</th>
                                <th className="p-4">City</th>
                                <th className="p-4">Assigned By</th>
                                <th className="p-4">Assigned At</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {group.properties.map((p) => <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">

                                  <td className="p-4 font-medium text-navy dark:text-white">
                                    {p.property.title}
                                  </td>
                                  <td className="p-4 text-slate-600 dark:text-slate-300">
                                    {p.property.city}
                                  </td>
                                  <td className="p-4 text-slate-600 dark:text-slate-300">
                                    Admin
                                  </td>
                                  <td className="p-4 text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {new Date(p.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="p-4">
                                    {p.isActive ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                        <CheckCircle className="w-3 h-3" />{' '}
                                        Active
                                      </span> : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                        <XCircle className="w-3 h-3" /> Inactive
                                      </span>}
                                  </td>
                                  <td className="p-4 text-right">
                                    {p.isActive && <button onClick={() => setUnassignTarget({
                          type: 'property',
                          agentId: group.agentId,
                          itemId: p.property.id,
                          itemName: p.property.title
                        })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Unassign Property">

                                        <Trash2 className="w-4 h-4" />
                                      </button>}
                                  </td>
                                </tr>)}
                            </tbody>
                          </table>
                        </div> : <p className="text-sm text-slate-500 dark:text-slate-400 italic pl-2">
                          No properties assigned.
                        </p>}
                    </div>

                    {/* Tenants Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          Assigned Tenants
                        </h4>
                        <button onClick={() => {
                  setActiveAgent({
                    id: group.agentId,
                    name: group.agentName
                  });
                  setIsAssignTenantOpen(true);
                }} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">

                          <Plus className="w-4 h-4" /> Assign Tenant
                        </button>
                      </div>

                      {group.tenants.length > 0 ? <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
                          <table className="w-full text-left text-sm min-w-[560px]">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                              <tr>
                                <th className="p-4">Tenant</th>
                                <th className="p-4">Contact</th>
                                <th className="p-4">Assigned By</th>
                                <th className="p-4">Assigned At</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {group.tenants.map((t) => <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">

                                  <td className="p-4 font-medium text-navy dark:text-white">
                                    {t.tenant.name}
                                  </td>
                                  <td className="p-4 text-slate-600 dark:text-slate-300">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        {t.tenant.email}
                                      </div>
                                      {t.tenant.phone && <div className="flex items-center gap-2">
                                          <Phone className="w-3 h-3 text-slate-400" />
                                          {t.tenant.phone}
                                        </div>}
                                    </div>
                                  </td>
                                  <td className="p-4 text-slate-600 dark:text-slate-300">
                                    Admin
                                  </td>
                                  <td className="p-4 text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {new Date(t.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="p-4">
                                    {t.isActive ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                        <CheckCircle className="w-3 h-3" />{' '}
                                        Active
                                      </span> : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                                        <XCircle className="w-3 h-3" /> Inactive
                                      </span>}
                                  </td>
                                  <td className="p-4 text-right">
                                    {t.isActive && <button onClick={() => setUnassignTarget({
                          type: 'tenant',
                          agentId: group.agentId,
                          itemId: t.tenant.id,
                          itemName: t.tenant.name
                        })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Unassign Tenant">

                                        <Trash2 className="w-4 h-4" />
                                      </button>}
                                  </td>
                                </tr>)}
                            </tbody>
                          </table>
                        </div> : <p className="text-sm text-slate-500 dark:text-slate-400 italic pl-2">
                          No tenants assigned.
                        </p>}
                    </div>
                  </div>}
              </div>)}
          </div>}
      </div>
    </div>;
}