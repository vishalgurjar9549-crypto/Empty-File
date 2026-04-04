import React, { useEffect } from 'react';
import { Users, Home, Clock, CheckCircle, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAdminStats, fetchRecentActivity } from '../../store/slices/admin.slice';
export function AdminDashboard() {
  const dispatch = useAppDispatch();
  const {
    user
  } = useAppSelector((state) => state.auth);
  const {
    stats,
    recentActivity,
    loading
  } = useAppSelector((state) => state.admin);
  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchRecentActivity(10));
  }, [dispatch]);
  if (!user) return null;
  const StatCard = ({
    icon: Icon,
    label,
    value,
    colorClass,
    link






  }: {icon: any;label: string;value: number;colorClass: string;link?: string;}) => <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-md hover:scale-[1.01] transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClass} transition-transform group-hover:scale-110 duration-300`}>

          <Icon className="w-6 h-6" />
        </div>
        {link && <Link to={link} className="text-slate-400 hover:text-navy dark:hover:text-white transition-colors">

            <ArrowRight className="w-5 h-5" />
          </Link>}
      </div>
      <p className="text-3xl font-bold text-navy dark:text-white mb-1">
        {value?.toLocaleString() || 0}
      </p>
      <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
        {label}
      </p>
    </div>;
  return <div className="min-h-screen bg-cream dark:bg-slate-950 pt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-playfair">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Overview of platform activity and moderation tasks
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
          <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" link="/admin/users" />

          <StatCard icon={Home} label="Total Properties" value={stats?.totalProperties || 0} colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" link="/admin/properties" />

          <StatCard icon={Clock} label="Pending Approvals" value={stats?.pendingApprovals || 0} colorClass="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400" link="/admin/properties?status=pending" />

          <StatCard icon={CheckCircle} label="Active Listings" value={stats?.activeListings || 0} colorClass="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" link="/admin/properties?status=approved" />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-navy dark:text-white" />
                <h2 className="text-lg font-bold text-navy dark:text-white">
                  Recent Activity
                </h2>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
              {recentActivity.length > 0 ? recentActivity.map((log) => <div key={log.id} className="p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-start gap-4">

                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${log.type === 'success' ? 'bg-green-500' : log.type === 'warning' ? 'bg-yellow-500' : log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />

                    <div>
                      <p className="text-sm font-medium text-navy dark:text-white">
                        {log.action}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {log.target} •{' '}
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>) : <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No recent activity recorded
                </div>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6 h-fit">
            <h2 className="text-lg font-bold text-navy dark:text-white mb-4 sm:mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <Link to="/admin/properties" className="block w-full p-3 sm:p-4 bg-navy/5 dark:bg-white/5 hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy rounded-xl transition-all duration-200 group">

                <div className="flex items-center justify-between">
                  <span className="font-medium dark:text-white dark:group-hover:text-navy">
                    Review Properties
                  </span>
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform dark:text-white dark:group-hover:text-navy" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80 dark:group-hover:text-navy/80 mt-1">
                  {stats?.pendingApprovals || 0} pending approvals
                </p>
              </Link>

              <Link to="/admin/users" className="block w-full p-3 sm:p-4 bg-navy/5 dark:bg-white/5 hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy rounded-xl transition-all duration-200 group">

                <div className="flex items-center justify-between">
                  <span className="font-medium dark:text-white dark:group-hover:text-navy">
                    Manage Users
                  </span>
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform dark:text-white dark:group-hover:text-navy" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80 dark:group-hover:text-navy/80 mt-1">
                  View and manage user accounts
                </p>
              </Link>

              <Link to="/admin/agent-assignments" className="block w-full p-3 sm:p-4 bg-navy/5 dark:bg-white/5 hover:bg-navy hover:text-white dark:hover:bg-white dark:hover:text-navy rounded-xl transition-all duration-200 group">

                <div className="flex items-center justify-between">
                  <span className="font-medium dark:text-white dark:group-hover:text-navy">
                    Agent Assignments
                  </span>
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform dark:text-white dark:group-hover:text-navy" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80 dark:group-hover:text-navy/80 mt-1">
                  View property and tenant assignments
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>;
}