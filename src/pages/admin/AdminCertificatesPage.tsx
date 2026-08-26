import React, { useEffect, useState } from 'react';
import {
    Search,
    Award,
    Download,
    Eye,
    Calendar
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAllCertificates } from '../../api/dashboard';
import { toast } from 'sonner';

interface Certificate {
    id: string;
    userName: string;
    courseName: string;
    issuedAt: string;
    certCode: string;
    imageUrl?: string;
}

const AdminCertificatesPage: React.FC = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCertData = async () => {
        try {
            setLoading(true);
            const data = await getAllCertificates();
            setCertificates(data);
        } catch (error) {
            console.error('Failed to fetch certificates:', error);
            toast.error('Failed to load certification ledger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertData();
    }, []);

    const filteredCertificates = certificates.filter(cert =>
        cert.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.certCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Certificates</h1>
                    <p className="text-gray-500 font-medium">Registry of all issued training certifications.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-sm active:scale-95">
                    <Download className="w-4 h-4" />
                    Download Registry
                </button>
            </div>

            <div className="flex items-center gap-2 mt-8">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, course or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gray-200 transition-all placeholder:text-gray-400 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">Certification Ledger</h2>
                    <p className="text-sm text-gray-500 font-medium mt-1">Official records of guard course completions and IDs.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Course</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Issued Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cert Code</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCertificates.map((cert) => (
                                <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-xs border border-amber-100 group-hover:rotate-12 transition-transform">
                                                <Award className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{cert.userName}</div>
                                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Verified Recipient</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-bold text-gray-600 truncate max-w-[200px] inline-block">{cert.courseName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-xs font-bold">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <code className="text-[10px] font-black bg-gray-50 px-2 py-1 rounded border border-gray-100 text-gray-700">{cert.certCode}</code>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${cert.imageUrl}`, '_blank')}
                                                className="p-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all active:scale-90"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const link = document.createElement('a');
                                                    link.href = `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${cert.imageUrl}`;
                                                    link.download = `Certificate_${cert.certCode}.png`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all active:scale-90"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredCertificates.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                                <Award className="w-8 h-8 text-gray-200" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-gray-900 font-bold">No certificates found</p>
                                                <p className="text-gray-400 text-sm font-medium">Try adjusting your filters or search.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCertificatesPage;
