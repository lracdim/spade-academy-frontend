import React, { useEffect, useState } from 'react';
import { Award, RefreshCcw, Lock, Download, Calendar, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getGuardDashboardStats, generateCertificate, getMyCertificates, type GuardDashboardStats } from '../../api/dashboard';
import { toast } from 'sonner';

interface Certificate {
    id: string;
    certCode: string;
    issuedAt: string;
    imageUrl: string;
    courseTitle: string;
    courseId?: string;
}

const GuardCertificates: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [stats, setStats] = useState<GuardDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchData = async () => {
        try {
            const data = await getMyCertificates();
            if (Array.isArray(data)) setCertificates(data);
            const dashboardStats = await getGuardDashboardStats();
            setStats(dashboardStats);
        } catch (error) {
            console.error('Error fetching certificates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGenerate = async () => {
        if (!stats?.continueCourse?.id) {
            toast.error('No course found.');
            return;
        }
        setGenerating(true);
        try {
            await generateCertificate(stats.continueCourse.id);
            toast.success('Certificate generated!');
            await fetchData();
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Could not generate.';
            toast.error(`Failed: ${msg}`);
        } finally {
            setGenerating(false);
        }
    };


    const handleDownload = (imageUrl: string, certCode: string) => {
        const link = document.createElement('a');
        link.href = `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl}`;
        link.download = `Certificate_${certCode}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-500 font-medium tracking-tight">Loading your achievements...</p>
            </div>
        );
    }

    const progress = stats?.continueCourse?.progress ?? 0;
    const isEligible = progress === 100 && !generating;

    return (
        <div className="space-y-8 w-full py-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Award className="w-8 h-8 text-[#d0a868]" />
                        Professional Certifications
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        View and manage your earned qualifications from Spade Academy.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <button
                        onClick={handleGenerate}
                        disabled={!isEligible}
                        title={!isEligible ? `Complete 100% to unlock (currently ${progress}%)` : 'Generate certificate'}
                        className={`flex items-center gap-2 px-6 py-3 font-black rounded-2xl transition-all uppercase text-[11px] tracking-[0.15em] shadow-lg ${isEligible
                                ? 'bg-[#d0a868] hover:bg-[#b8955c] text-white cursor-pointer'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {generating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : isEligible ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {generating ? 'Generating...' : 'Generate Certificate'}
                    </button>
                    {!isEligible && !generating && (
                        <p className="text-[11px] text-gray-400 font-medium">
                            {progress < 100 ? `Requires 100% — currently ${progress}%` : 'Complete all videos & quizzes to unlock'}
                        </p>
                    )}
                </div>
            </div>

            {certificates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Award className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 underline decoration-[#d0a868] decoration-2 underline-offset-4">No certificates yet</h3>
                    <p className="text-gray-500 max-w-md px-6">
                        Complete your assigned courses and pass all assessments to earn your certifications.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert: Certificate) => (
                        <div key={cert.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="aspect-[1.4/1] relative overflow-hidden bg-gray-50">
                                <img
                                    src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${cert.imageUrl.replace('.png', '_thumb.png')}`}
                                    alt={cert.courseTitle}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (target.src.includes('_thumb.png')) {
                                            target.src = `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${cert.imageUrl}`;
                                        }
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                        onClick={() => handleDownload(cert.imageUrl, cert.certCode)}
                                        className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-[#d0a868] hover:text-white transition"
                                    >
                                        <Download className="w-4 h-4" /> Download PNG
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-[#d0a868]/10 px-2 py-0.5 rounded text-[10px] font-black text-[#d0a868] uppercase tracking-wider">Verified</div>
                                    <span className="text-[10px] font-bold text-gray-400 font-mono tracking-tighter">{cert.certCode}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-4 group-hover:text-[#d0a868] transition-colors">{cert.courseTitle}</h3>

                                <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Issued on {new Date(cert.issuedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span className="font-medium text-emerald-600">Valid & Active</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownload(cert.imageUrl, cert.certCode)}
                                    className="w-full mt-4 py-3 bg-gray-900 hover:bg-[#d0a868] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download Certificate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuardCertificates;