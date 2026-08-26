import React, { useEffect, useState } from 'react';
import {
    Users,
    BookOpen,
    Award,
    TrendingUp,
    Download,
    Plus,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboardStats } from '../../api/dashboard';
import type { DashboardStats } from '../../api/dashboard';

const AdminDashboard: React.FC = () => {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const stats = await getDashboardStats();
                setData(stats);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        
        // Real-time updates: Poll every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const stats = [
        {
            label: 'Certificates Issued',
            value: data?.stats.certificatesIssued !== undefined ? data.stats.certificatesIssued : 0,
            icon: Award,
            subtext: '+0 last 30 days from last month',
            color: 'text-[#d0a868]'
        },
        {
            label: 'Active Guards',
            value: data?.stats.activeGuards !== undefined ? data.stats.activeGuards : 0,
            icon: Users,
            subtext: 'Active Trainees from last month',
            color: 'text-[#d0a868]'
        },
        {
            label: 'Total Courses',
            value: data?.stats.totalCourses !== undefined ? data.stats.totalCourses : 0,
            icon: BookOpen,
            subtext: 'Published Content from last month',
            color: 'text-[#d0a868]'
        },
        {
            label: 'Completion Rate',
            value: data?.stats.completionRate || '0%',
            icon: TrendingUp,
            subtext: 'All Courses, All Guards Avg.'
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                        <Download className="w-4 h-4" />
                        Download Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95">
                        <Plus className="w-4 h-4" />
                        Create Course
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            <stat.icon className="w-5 h-5 text-gray-300 group-hover:text-gray-900 transition-colors" />
                        </div>
                        <p className="text-4xl font-bold text-gray-900 tracking-tighter">{stat.value}</p>
                        <p className="text-[11px] font-semibold text-[#d0a868] mt-3 flex items-center gap-1">
                            {stat.subtext}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Certificates Issued (Last 7 Days)</h3>
                            <p className="text-xs text-gray-400 font-medium italic">Data updates automatically from system logs</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#d0a868] rounded-sm shadow-sm shadow-[#d0a868]/20" />
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Issuance Volume</span>
                        </div>
                    </div>
                    
                    <div className="h-64 flex items-end justify-between gap-1 group/chart pt-4">
                        {data?.stats.certificateTrend && data.stats.certificateTrend.length > 0 ? (
                            data.stats.certificateTrend.map((day, i) => {
                                const maxCount = Math.max(...(data.stats.certificateTrend?.map(d => d.count) || [1]));
                                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                                
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center group/bar cursor-default">
                                        <div className="w-full flex flex-col justify-end items-center h-48 relative px-1 sm:px-2 md:px-3">
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 bg-black text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-all transform translate-y-2 group-hover/bar:translate-y-0 z-20 pointer-events-none whitespace-nowrap">
                                                {day.count} CERTIFICATES
                                            </div>
                                            
                                            {/* Bar */}
                                            <div 
                                                className="w-full bg-[#d0a868] rounded-t-lg transition-all duration-1000 ease-out group-hover/bar:bg-black relative overflow-hidden shadow-lg shadow-[#d0a868]/10"
                                                style={{ height: `${Math.max(height, day.count > 0 ? 4 : 0)}%` }}
                                            >
                                                {/* Animated shine effect */}
                                                <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10 skew-y-12 transform -translate-y-full group-hover/bar:translate-y-full transition-transform duration-700" />
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter group-hover/bar:text-[#d0a868] transition-colors">{day.date}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 p-8">
                                <Award className="w-8 h-8 text-gray-200 mb-3" />
                                <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest">Synchronizing real-time data...</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Recent Training Activity</h3>
                    <p className="text-sm text-gray-500 mb-8">Latest completed lessons by guards.</p>

                    <div className="space-y-1 flex-1">
                        {data?.recentActivity && data.recentActivity.length > 0 ? (
                            data.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-4 -mx-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors">{activity.userName}</p>
                                        <p className="text-xs text-gray-400 font-medium">{activity.courseTitle}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1.5">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full ${activity.passed ? 'bg-[#d0a868]/10 text-[#d0a868]' : 'bg-rose-50 text-rose-600'
                                            }`}>
                                            {activity.passed ? 'PASSED' : 'FAILED'}
                                        </span>
                                        <span className="text-[10px] text-gray-300 font-bold">
                                            {new Date(activity.attemptedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl bg-gray-50/30 p-8 text-center">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6 text-gray-200" />
                                </div>
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">No recent activity</p>
                                <p className="text-xs text-gray-300">Activity will appear here as guards complete courses.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
