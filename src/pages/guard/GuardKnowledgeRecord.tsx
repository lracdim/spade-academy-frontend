import React, { useEffect, useState } from 'react';
import { BookText, Search, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMyQuizAttempts } from '../../api/quiz';
import type { QuizAttempt } from '../../api/quiz';
import { cn } from '@/lib/utils';

const GuardKnowledgeRecord: React.FC = () => {
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const data = await getMyQuizAttempts();
                setAttempts(data);
            } catch (error) {
                console.error("Failed to fetch quiz attempts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAttempts();
    }, []);

    const filteredAttempts = attempts.filter(attempt =>
        attempt.moduleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: attempts.length,
        passed: attempts.filter(a => a.passed).length,
        avgScore: attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
            : 0
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section with brand feel */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">KNOWLEDGE RECORD</h1>
                    <p className="text-[10px] font-bold text-[#d0a868] uppercase tracking-[0.2em] mt-1">Acquisition History & Performance</p>
                </div>
            </div>

            {/* Quick Stats - Portfolio Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Attempts</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-gray-900 leading-none">{stats.total}</p>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sessions</span>
                    </div>
                </div>
                <div className="bg-white border border-gray-50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Quizzes Passed</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-[#d0a868] leading-none">{stats.passed}</p>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Achieved</span>
                    </div>
                </div>
                <div className="bg-white border border-gray-50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Average Score</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-gray-900 leading-none">{stats.avgScore}%</p>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mastery</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm overflow-hidden pb-6">
                {/* Table Toolbar */}
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <h2 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">History Log</h2>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="SEARCH BY MODULE OR COURSE..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:bg-white focus:border-[#d0a868] transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-y border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Module & Course</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Result</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Achieved</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAttempts.length > 0 ? (
                                filteredAttempts.map((attempt) => (
                                    <tr key={attempt.id} className="hover:bg-gray-50/50 transition-colors group cursor-default">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-[#d0a868] transition-colors">{attempt.moduleTitle}</span>
                                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.1em]">{attempt.courseTitle}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "text-base font-black leading-none",
                                                attempt.passed ? "text-gray-900" : "text-gray-300"
                                            )}>
                                                {attempt.score}%
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                {attempt.passed ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                                        <span className="text-[9px] font-black text-green-600 uppercase tracking-[0.15em]">MASTERED</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                                                        <span className="text-[9px] font-black uppercase tracking-[0.15em]">INCOMPLETE</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {new Date(attempt.attemptedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => navigate(`/guard/knowledge-record/review/${attempt.id}`)}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50/50 text-[#d0a868] hover:bg-[#d0a868] hover:text-white hover:shadow-lg hover:shadow-[#d0a868]/20 transition-all active:scale-95 group/btn"
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">Preview</span>
                                                <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 space-y-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-2">
                                                <BookText className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-bold text-gray-900">No records found</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Begin your first assessment to start tracking</p>
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

export default GuardKnowledgeRecord;
