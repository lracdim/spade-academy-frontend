import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Calendar, User, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface CertData {
    certCode: string;
    issuedAt: string;
    userName: string;
    courseTitle: string;
}

const VerifyCertificate: React.FC = () => {
    const { code } = useParams<{ code: string }>();
    const [certData, setCertData] = useState<CertData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/certificates/verify/${code}`);
                if (!response.ok) {
                    throw new Error('Certificate not found or invalid.');
                }
                const data = await response.json();
                setCertData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (code) verify();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-400 mt-4 animate-pulse">Verifying Credentials...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
            <div className="max-w-xl w-full">
                {error ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center backdrop-blur-xl animate-in fade-in zoom-in duration-500">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-black text-white mb-2 tracking-tighter">Verification Failed</h1>
                        <p className="text-red-200/60 font-medium mb-8 uppercase text-xs tracking-widest">{error}</p>
                        <Link to="/login" className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all">
                            Back to Academy
                        </Link>
                    </div>
                ) : certData && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Header Banner */}
                        <div className="bg-gradient-to-r from-[#d0a868] to-[#b8955c] p-10 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                            </div>
                            <ShieldCheck className="w-20 h-20 text-white mx-auto mb-4 relative z-10" />
                            <h1 className="text-3xl font-black text-white tracking-tighter mb-1 relative z-10">VALIDATED CREDENTIALS</h1>
                            <div className="inline-flex items-center gap-2 bg-black/10 px-4 py-1.5 rounded-full text-white/90 text-[10px] font-black uppercase tracking-widest relative z-10 border border-white/10">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Spade Global Security Secure Verification
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10">
                                        <User className="w-6 h-6 text-[#d0a868]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Recipient Name</p>
                                        <h2 className="text-2xl font-black text-white tracking-tight">{certData.userName}</h2>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10">
                                        <BookOpen className="w-6 h-6 text-[#d0a868]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Course Completed</p>
                                        <h2 className="text-xl font-bold text-white tracking-tight leading-tight">{certData.courseTitle}</h2>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Issue Date</p>
                                        </div>
                                        <p className="text-white font-bold">{new Date(certData.issuedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">Cert ID</p>
                                        </div>
                                        <p className="text-white font-mono font-bold tracking-tighter">{certData.certCode}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center">
                                <p className="text-emerald-400 font-black text-xs uppercase tracking-widest">Digital authenticity verified</p>
                                <p className="text-emerald-200/50 text-[10px] font-medium mt-1 uppercase italic">This is an official document from Orchid Investment Group DBA Spade Security Services</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-white/5 bg-black/20 text-center">
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">© 2024 Spade Academy System</p>
                            <Link to="/login" className="text-[#d0a868] hover:text-white font-black text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                Visit Spade Academy <ShieldCheck className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyCertificate;
