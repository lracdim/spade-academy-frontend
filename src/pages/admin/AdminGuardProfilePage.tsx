import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, Clock, FileText, PlayCircle, XCircle } from 'lucide-react';
import { getGuardProfile, type GuardProfile } from '../../api/user';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner';

const formatWatchTime = (seconds: number) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const AdminGuardProfilePage: React.FC = () => {
    const { guardId } = useParams<{ guardId: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<GuardProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!guardId) return;
        setLoading(true);
        getGuardProfile(guardId)
            .then(setProfile)
            .catch(error => {
                console.error('Failed to load guard profile:', error);
                toast.error('Could not load this guard');
            })
            .finally(() => setLoading(false));
    }, [guardId]);

    if (loading) {
        return <div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" /></div>;
    }

    if (!profile) {
        return (
            <div className="p-12 text-center space-y-4">
                <p className="text-gray-500 font-medium">This guard could not be loaded.</p>
                <button onClick={() => navigate('/admin/guards')} className="text-sm font-bold text-[#d0a868] hover:underline">
                    Back to guards
                </button>
            </div>
        );
    }

    const { guard, summary, courseProgress, attempts, certificates } = profile;
    const initials = guard.fullName.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);

    const stats = [
        { label: 'Watch time', value: formatWatchTime(summary.watchSeconds), icon: Clock },
        { label: 'Modules completed', value: String(summary.modulesCompleted), icon: PlayCircle },
        { label: 'Average score', value: `${summary.averageScore}%`, icon: FileText },
        { label: 'Certificates', value: String(summary.certificatesEarned), icon: Award },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-16">
            <button onClick={() => navigate('/admin/guards')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" /> Back to guards
            </button>

            {/* Identity */}
            <header className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#d0a868]/10 text-[#9b743d] font-black flex items-center justify-center text-lg">
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-black text-gray-900">{guard.fullName}</h1>
                    <p className="text-sm text-gray-500 font-medium">{guard.email || 'No email on file'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border border-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                            {guard.employeeId}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${guard.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                            {guard.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                            Joined {new Date(guard.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                {summary.lastActivity && (
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last activity</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(summary.lastActivity).toLocaleDateString()}</p>
                    </div>
                )}
            </header>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <stat.icon className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Course progress */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Course progress</h2>
                    </div>
                    <div className="p-5 space-y-5">
                        {courseProgress.length === 0 && <p className="text-sm text-gray-400">No courses assigned.</p>}
                        {courseProgress.map(course => (
                            <div key={course.courseId}>
                                <div className="flex items-center justify-between mb-2 gap-3">
                                    <p className="text-xs font-bold text-gray-900 truncate">{course.courseTitle}</p>
                                    <span className="text-xs font-black text-gray-900 shrink-0">{course.completionPercent}%</span>
                                </div>
                                <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-50">
                                    <div className="h-full bg-[#d0a868] rounded-full transition-all" style={{ width: `${course.completionPercent}%` }} />
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                                    {course.watchedModules} of {course.totalModules} modules
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Certificates */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Certificates</h2>
                    </div>
                    <div className="p-5 space-y-3">
                        {certificates.length === 0 && <p className="text-sm text-gray-400">No certificates earned yet.</p>}
                        {certificates.map(certificate => (
                            <div key={certificate.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-50">
                                <Award className="w-4 h-4 text-[#d0a868] shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-gray-900 truncate">{certificate.courseTitle}</p>
                                    <p className="text-[10px] font-mono font-bold text-gray-400 mt-0.5">{certificate.certCode}</p>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 shrink-0">
                                    {new Date(certificate.issuedAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Quiz history */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Assessment history</h2>
                    <span className="text-[10px] font-bold text-gray-400">
                        {summary.passedAttempts} passed of {summary.totalAttempts}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <th className="px-5 py-3 text-left">Module</th>
                                <th className="px-5 py-3 text-left">Course</th>
                                <th className="px-5 py-3 text-center">Score</th>
                                <th className="px-5 py-3 text-center">Result</th>
                                <th className="px-5 py-3 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {attempts.map(attempt => (
                                <tr key={attempt.id} className="hover:bg-gray-50/50">
                                    <td className="px-5 py-3 text-xs font-bold text-gray-900">{attempt.moduleTitle}</td>
                                    <td className="px-5 py-3 text-xs text-gray-500">{attempt.courseTitle}</td>
                                    <td className="px-5 py-3 text-center text-xs font-black text-gray-900">{attempt.score}%</td>
                                    <td className="px-5 py-3 text-center">
                                        {attempt.passed
                                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                                            : <XCircle className="w-4 h-4 text-red-400 inline" />}
                                    </td>
                                    <td className="px-5 py-3 text-right text-[10px] font-bold text-gray-400">
                                        {new Date(attempt.attemptedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {attempts.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No assessments taken yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AdminGuardProfilePage;
