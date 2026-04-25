import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search, User, Mail, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllUsers, updateUserStatus } from '../../store/slices/admin.slice';
import { UserStatusModal } from '../../components/admin/UserStatusModal';
import { UserStatus } from '../../types/admin.types';
import { User as UserType } from '../../types/api.types';

type UserSort = 'createdAt_desc' | 'createdAt_asc';
type JoinedSortDirection = 'asc' | 'desc' | null;

export function AdminUsers() {
  const dispatch = useAppDispatch();
  const {
    users,
    usersMeta,
    loading
  } = useAppSelector((state) => state.admin);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sort, setSort] = useState<UserSort>('createdAt_desc');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const activeUsersRequestRef = useRef<{ abort: () => void } | null>(null);
  const searchTermRef = useRef(searchTerm);

  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearchTerm = searchInput.trim();

      if (nextSearchTerm !== searchTermRef.current) {
        setCurrentPage(1);
        setSearchTerm(nextSearchTerm);
      }
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const loadUsers = useCallback(() => {
    activeUsersRequestRef.current?.abort();

    const request = dispatch(fetchAllUsers({
      page: currentPage,
      limit,
      role: filterRole !== 'all' ? filterRole : undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      search: searchTerm || undefined,
      sort
    }));

    activeUsersRequestRef.current = request;
    request.finally(() => {
      if (activeUsersRequestRef.current === request) {
        activeUsersRequestRef.current = null;
      }
    });

    return request;
  }, [currentPage, dispatch, filterRole, filterStatus, limit, searchTerm, sort]);

  useEffect(() => {
    const request = loadUsers();

    return () => {
      request.abort();
    };
  }, [loadUsers]);

  useEffect(() => {
    return () => {
      activeUsersRequestRef.current?.abort();
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleRoleChange = (newRole: string) => {
    setFilterRole(newRole);
    setCurrentPage(1);
  };

  const handleStatusChange = (newStatus: string) => {
    setFilterStatus(newStatus);
    setCurrentPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: UserSort) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleJoinedDateSort = () => {
    handleSortChange(sort === 'createdAt_desc' ? 'createdAt_asc' : 'createdAt_desc');
  };

  const handleStatusUpdate = (status: UserStatus) => {
    if (selectedUser) {
      dispatch(updateUserStatus({
        id: selectedUser.id,
        status
      }));
    }
  };

  const getJoinedSortDirection = (): JoinedSortDirection => {
    if (sort === 'createdAt_asc') return 'asc';
    if (sort === 'createdAt_desc') return 'desc';
    return null;
  };

  const SortIndicator = () => {
    const direction = getJoinedSortDirection();
    if (!direction) return <span className="ml-2 opacity-40">↕</span>;
    return <span className="ml-2 text-navy dark:text-white">{direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const getRoleBadge = (role: string) => {
    const normalizedRole = role.toLowerCase();
    const styles = {
      owner: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      tenant: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      agent: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
      admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
    };

    return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[normalizedRole as keyof typeof styles] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
        {normalizedRole}
      </span>;
  };

  const getStatusBadge = (user: UserType) => {
    const status = (user as any).status || ((user as any).isActive ? 'active' : 'disabled');

    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
        {status === 'active' ? 'Active' : 'Disabled'}
      </span>;
  };

  return <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20 transition-colors duration-300">
      <UserStatusModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} onConfirm={handleStatusUpdate} currentStatus={(selectedUser as any)?.status || 'active'} userName={selectedUser?.name || ''} />


      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-playfair">
              User Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage user accounts and permissions
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search users..." value={searchInput} onChange={(e) => handleSearchChange(e.target.value)} disabled={loading} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy dark:text-white disabled:opacity-70" />

          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 p-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="role-filter" className="text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                  Role:
                </label>
                <select id="role-filter" value={filterRole} onChange={(e) => handleRoleChange(e.target.value)} disabled={loading} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm outline-none transition focus:border-navy focus:ring-1 focus:ring-navy dark:focus:border-white dark:focus:ring-white cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-70">
                  <option value="all">All</option>
                  <option value="owner">Owner</option>
                  <option value="tenant">Tenant</option>
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="status-filter" className="text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                  Status:
                </label>
                <select id="status-filter" value={filterStatus} onChange={(e) => handleStatusChange(e.target.value)} disabled={loading} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm outline-none transition focus:border-navy focus:ring-1 focus:ring-navy dark:focus:border-white dark:focus:ring-white cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-70">
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                  Sort:
                </label>
                <select id="sort-select" value={sort} onChange={(e) => handleSortChange(e.target.value as UserSort)} disabled={loading} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm outline-none transition focus:border-navy focus:ring-1 focus:ring-navy dark:focus:border-white dark:focus:ring-white cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-70">
                  <option value="createdAt_desc">Latest</option>
                  <option value="createdAt_asc">Oldest</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="limit-select" className="text-sm text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                Rows per page:
              </label>
              <select id="limit-select" value={limit} onChange={(e) => handleLimitChange(Number(e.target.value))} disabled={loading} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm outline-none transition focus:border-navy focus:ring-1 focus:ring-navy dark:focus:border-white dark:focus:ring-white cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-70">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          {loading ? <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy dark:border-white mx-auto"></div>
            </div> : users.length > 0 ? <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-4 md:px-6 font-medium">User</th>
                    <th className="px-3 py-4 md:px-6 font-medium">Role</th>
                    <th className="px-3 py-4 md:px-6 font-medium">
                      <button type="button" onClick={handleJoinedDateSort} disabled={loading} className="inline-flex items-center uppercase tracking-wider hover:text-navy dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-70" title="Click to sort by joined date">
                        Joined Date
                        <SortIndicator />
                      </button>
                    </th>
                    <th className="px-3 py-4 md:px-6 font-medium">Status</th>
                    <th className="px-3 py-4 md:px-6 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {users.map((user) => <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">

                      <td className="px-3 py-4 md:px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-navy/5 dark:bg-white/10 flex items-center justify-center text-navy dark:text-white font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-navy dark:text-white">
                              {user.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 md:px-6">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-3 py-4 md:px-6 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-3 py-4 md:px-6">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-3 py-4 md:px-6 text-right">
                        <button onClick={() => setSelectedUser(user)} className="px-4 py-2 text-sm font-medium text-navy dark:text-white bg-navy/5 dark:bg-white/10 hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy rounded-lg transition-colors">

                          Manage
                        </button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div> : <div className="p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Try adjusting your filters or search terms
              </p>
            </div>}
        </div>

        {usersMeta && (
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-medium">
                  Page {usersMeta.page} of {usersMeta.totalPages || 1}
                </span>
                <span className="text-slate-500 dark:text-slate-400 ml-4">
                  Total: <span className="font-medium text-navy dark:text-white">{usersMeta.total}</span> users
                </span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1 || loading} className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Previous
                </button>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= (usersMeta.totalPages || 1) || loading} className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>;
}
