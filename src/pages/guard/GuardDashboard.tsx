import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Download, PlayCircle, TrendingUp, Copy } from 'lucide-react';
import { getGuardDashboardStats, type GuardDashboardStats } from '../../api/dashboard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const resolveUrl = (url: string | null | undefined): string => {
    if (!url) return '/logo.jpg';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${base}${url}`;
};

const GuardDashboard: React.FC = () => {
    const navigate = useNavigate();
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [stats, setStats] = useState<GuardDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const handleDownloadReport = async () => {
        if (!dashboardRef.current) return;
        try {
            const canvas = await html2canvas(dashboardRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Guard_Training_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Report generation failed:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await getGuardDashboardStats();
            console.log('[Dashboard] Stats received:', data);
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch guard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // ✅ FIX: Fetch immediately on mount
        fetchStats();

        // ✅ FIX: Poll every 15s (was 30s) for faster real-time feel
        const interval = setInterval(fetchStats, 15000);

        // ✅ FIX: Refetch when user comes back to this tab/window
        // This covers the case where they watched a video and navigated back
        const handleFocus = () => fetchStats();
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) fetchStats();
        });

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const topStats = [
        {
            label: 'COMPLETION',
            value: `${stats?.stats?.overallCompletionPercentage ?? 0}%`,
            subtext: 'Overall Progress'
        },
        {
            label: 'TOTAL SCORE',
            value: `${stats?.stats?.totalPoints ?? 0}`,
            subtext: `${stats?.stats?.highestQuizScore ?? 0}% Best`
        },
        {
            label: 'LEARNING',
            value: `${stats?.stats?.activeLearnings ?? 0}/${stats?.stats?.totalCourses ?? 0}`,
            subtext: 'Active courses'
        },
        {
            label: 'AWARDS',
            value: `${stats?.stats?.certificatesIssued ?? 0}`,
            subtext: 'Certificates earned'
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
        <div ref={dashboardRef} className="h-[calc(100vh-8rem)] flex flex-col space-y-4 px-2 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between py-2 shrink-0">
                <div className="space-y-0.5">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase leading-none">DASHBOARD</h1>
                    <p className="text-[9px] font-bold text-[#d0a868] uppercase tracking-[0.2em]">Operational Readiness & Training Overview</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 px-4 h-10 text-gray-600 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 group/btn"
                    >
                        <Download className="w-4 h-4 group-hover/btn:text-[#d0a868] transition-colors" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Download Report</span>
                    </button>
                    <div className="hidden md:flex h-10 px-3 items-center bg-[#111827] rounded-xl border border-white/5 space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.1em]">System Online</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {topStats.map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-50 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all duration-500 group relative overflow-hidden active:scale-[0.98]">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#d0a868]/5 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-125" />
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</span>
                            <TrendingUp className="w-3 h-3 text-gray-200 group-hover:text-[#d0a868]/30 transition-colors" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{stat.value}</p>
                            <p className="text-[8px] font-bold text-[#d0a868] uppercase tracking-tighter mt-1">{stat.subtext}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-0">
                {/* Learning Progress */}
                <div className="bg-white rounded-[2rem] border border-gray-50 p-6 lg:p-8 lg:col-span-2 shadow-sm relative overflow-hidden group flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8 shrink-0">
                        <div className="space-y-0.5">
                            <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Module Milestones</h2>
                            <p className="text-[10px] text-gray-400 font-medium">Tracking videos and assessments</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#d0a868]/40">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {[
                            {
                                label: 'Video Content',
                                icon: PlayCircle,
                                value: stats?.stats?.videoCompletionPercentage ?? 0,
                                color: 'from-[#d0a868] to-[#e6c18a]'
                            },
                            {
                                label: 'Quiz Assessments',
                                icon: Copy,
                                value: stats?.stats?.averageQuizScore ?? 0,
                                color: 'from-gray-900 to-gray-700'
                            },
                            {
                                label: 'Total Proficiency',
                                icon: Award,
                                value: stats?.stats?.totalProficiency ?? 0,
                                color: 'from-emerald-500 to-emerald-400'
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="group/item">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover/item:bg-white group-hover/item:shadow-md transition-all">
                                            <item.icon className="w-3 h-3 text-gray-400 group-hover/item:text-[#d0a868] transition-colors" />
                                        </div>
                                        <span className="text-[9px] font-black text-gray-500 group-hover/item:text-gray-900 uppercase tracking-[0.2em] transition-colors">{item.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-xl font-black text-gray-900 leading-none">{item.value}</span>
                                        <span className="text-[9px] font-black text-gray-400 uppercase">%</span>
                                    </div>
                                </div>
                                <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-50 shadow-inner">
                                    <div
                                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                        style={{ width: `${Math.max(item.value, 4)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between shrink-0">
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">Live data synchronization active</p>
                        <button
                            onClick={fetchStats}
                            className="text-[8px] font-black text-[#d0a868] uppercase tracking-widest hover:underline underline-offset-4 font-mono"
                        >
                            {/* ✅ FIX: clicking "Total Monitoring" now manually refreshes */}
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Side Stack */}
                <div className="flex flex-col gap-4 h-full overflow-hidden">
                    {/* Ranking Widget */}
                    <div className="bg-[#111827] rounded-[2rem] p-6 shadow-xl relative overflow-hidden group shrink-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d0a868]/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[#d0a868]/20 transition-all duration-1000" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h2 className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Ranking</h2>
                            <div className="bg-white/5 px-2 py-0.5 rounded-lg">
                                <span className="text-[7px] font-black text-[#d0a868] uppercase tracking-widest">Global</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                    <Award className="w-4 h-4 text-[#d0a868]" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white tracking-tighter leading-none">{stats?.stats?.organisationRank || '-'}</p>
                                    <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mt-1">Org Rank</p>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-white/10 mx-2" />
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#d0a868] flex items-center justify-center shadow-lg shadow-[#d0a868]/20">
                                    <span className="text-sm text-gray-900 font-bold">🪙</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white tracking-tighter leading-none">{stats?.stats?.totalPoints ?? 0}</p>
                                    <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mt-1">My Points</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 relative z-10">
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-[#d0a868] w-1/3 rounded-full opacity-60" />
                            </div>
                        </div>
                    </div>

                    {/* Active Path */}
                    <div className="bg-white rounded-[2rem] border border-gray-50 p-6 shadow-sm relative overflow-hidden group/resume flex flex-col justify-between flex-1 min-h-0">
                        <div className="space-y-4 overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between shrink-0">
                                <h2 className="text-[9px] font-black text-gray-900 uppercase tracking-[0.3em]">Active Path</h2>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d0a868] animate-pulse" />
                            </div>

                            {stats?.continueCourse ? (
                                <div
                                    onClick={stats.continueCourse.progress === 100
                                        ? undefined
                                        : () => navigate(`/guard/learning-hub/${stats.continueCourse?.id}/play`)}
                                    className={`${stats.continueCourse.progress === 100 ? '' : 'cursor-pointer'} space-y-4 flex-1 flex flex-col min-h-0`}
                                >
                                    <div className="aspect-[1.8/1] rounded-2xl overflow-hidden relative bg-gray-50 border border-gray-100 shadow-inner group/thumb shrink-0">
                                        <img
                                            src={resolveUrl(stats.continueCourse.thumbnail)}
                                            alt={stats.continueCourse.title}
                                            onError={(e) => { (e.target as HTMLImageElement).src = '/logo.jpg'; }}
                                            className="w-full h-full object-cover group-hover/resume:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gray-900/0 group-hover/resume:bg-gray-900/40 transition-all duration-500 flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-2xl flex items-center justify-center opacity-0 group-hover/resume:opacity-100 transform translate-y-2 group-hover/resume:translate-y-0 transition-all duration-500">
                                                <PlayCircle className="w-6 h-6 text-[#d0a868] fill-current" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-2 left-2 right-2 h-1 bg-black/40 backdrop-blur-md rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#d0a868] transition-all duration-1000"
                                                style={{ width: `${stats.continueCourse.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1 shrink-0">
                                        <h3 className="text-xs font-bold text-gray-900 leading-tight group-hover/resume:text-[#d0a868] transition-colors truncate">
                                            {stats.continueCourse.title}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-[#d0a868] uppercase tracking-widest italic">
                                                {stats.continueCourse.progress}% {stats.continueCourse.progress === 100 ? 'COMPLETED' : 'IN PROGRESS'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-6 space-y-2">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-200">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Awaiting course assignment</p>
                                </div>
                            )}
                        </div>

                        {stats?.continueCourse && (
                            <button
                                onClick={() => {
                                    if (stats.continueCourse?.progress === 100) {
                                        navigate('/guard/certificates');
                                    } else {
                                        navigate(`/guard/learning-hub/${stats.continueCourse?.id}/play`);
                                    }
                                }}
                                className={`w-full py-3.5 mt-4 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 ${stats.continueCourse.progress === 100
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-[#d0a868] hover:opacity-90'
                                    }`}
                            >
                                {stats.continueCourse.progress < 100 ? 'Continue Course Training' : 'Course Completed'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuardDashboard;