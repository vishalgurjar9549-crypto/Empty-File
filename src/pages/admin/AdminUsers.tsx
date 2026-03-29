import React, { useEffect, useState } from 'react';
import { Search, User, Mail, Calendar, Shield, MoreVertical } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAllUsers, updateUserStatus } from '../../store/slices/admin.slice';
import { UserStatusModal } from '../../components/admin/UserStatusModal';
import { UserStatus } from '../../types/admin.types';
import { User as UserType } from '../../types/api.types';
export function AdminUsers() {
  const dispatch = useAppDispatch();
  const {
    users,
    loading
  } = useAppSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);
  const handleStatusUpdate = (status: UserStatus) => {
    if (selectedUser) {
      dispatch(updateUserStatus({
        id: selectedUser.id,
        status
      }));
    }
  };
  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const getRoleBadge = (role: string) => {
    const styles = {
      owner: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      tenant: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[role as keyof typeof styles]}`}>

        {role}
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
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy dark:text-white" />

          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          {loading ? <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy dark:border-white mx-auto"></div>
            </div> : filteredUsers.length > 0 ? <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-4 md:px-6 font-medium">User</th>
                    <th className="px-3 py-4 md:px-6 font-medium">Role</th>
                    <th className="px-3 py-4 md:px-6 font-medium">
                      Joined Date
                    </th>
                    <th className="px-3 py-4 md:px-6 font-medium">Status</th>
                    <th className="px-3 py-4 md:px-6 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredUsers.map((user) => <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">

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
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${(user as any).status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>

                          {(user as any).status === 'active' ? 'Active' : 'Disabled'}
                        </span>
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
                Try adjusting your search terms
              </p>
            </div>}
        </div>
      </div>
    </div>;
}