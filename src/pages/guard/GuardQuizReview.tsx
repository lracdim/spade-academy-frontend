import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Info, HelpCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getQuizAttemptDetails } from '../../api/quiz';

const GuardQuizReview: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!attemptId) return;
            try {
                setLoading(true);
                const result = await getQuizAttemptDetails(attemptId);
                
                // Parse options if they are strings
                const parsedQuestions = result.questions.map((q: any) => ({
                    ...q,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || [])
                }));
                
                setData({ ...result, questions: parsedQuestions });
            } catch (err: any) {
                console.error("Failed to fetch attempt details:", err);
                setError('Failed to load assessment details.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [attemptId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-500 font-medium">Loading Assessment Details...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm max-w-lg w-full space-y-4">
                    <p className="text-gray-500 font-medium">{error || 'Review details not found.'}</p>
                    <button
                        onClick={() => navigate('/guard/knowledge-record')}
                        className="flex items-center gap-2 text-[#d0a868] font-bold uppercase tracking-widest text-[10px] mx-auto hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back to History
                    </button>
                </div>
            </div>
        );
    }

    const { attempt, questions } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/guard/knowledge-record')}
                        className="p-3 text-gray-400 hover:text-gray-900 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{data.moduleTitle}</h1>
                        <p className="text-[10px] font-bold text-[#d0a868] uppercase tracking-[0.2em] mt-1">{data.courseTitle}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-50 shadow-sm">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">FINAL SCORE</p>
                        <p className={`text-2xl font-black tracking-tight ${attempt.passed ? 'text-gray-900' : 'text-red-500'}`}>{attempt.score}%</p>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div className="flex items-center gap-2">
                        {attempt.passed ? (
                            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">PASSED</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">INCOMPLETE</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-8">
                {questions.map((q: any, idx: number) => {
                    const userAnswer = attempt.answers[q.id];
                    const correctOption = q.options.find((opt: any) => opt.isCorrect);
                    const isCorrect = userAnswer === correctOption?.text;

                    return (
                        <div key={q.id} className="bg-white border border-gray-50 rounded-[2.5rem] p-8 shadow-sm group">
                            <div className="space-y-6">
                                {/* Question Header */}
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-sm
                                        ${isCorrect ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{q.text}</h3>
                                        <div className="flex items-center gap-2">
                                            <HelpCircle className="w-3.5 h-3.5 text-gray-300" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{q.type.replace(/_/g, ' ')}</span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {isCorrect ? (
                                            <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                                <CheckCircle2 className="w-4 h-4" /> Correct
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-black uppercase tracking-widest">
                                                <XCircle className="w-4 h-4" /> Incorrect
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="grid grid-cols-1 gap-3 pl-14">
                                    {q.options.map((opt: any, optIdx: number) => {
                                        const isSelected = userAnswer === opt.text;
                                        const isRight = opt.isCorrect;

                                        return (
                                            <div
                                                key={optIdx}
                                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                                                    ${isSelected && isRight ? 'bg-emerald-50 border-emerald-200' : ''}
                                                    ${isSelected && !isRight ? 'bg-red-50 border-red-200' : ''}
                                                    ${!isSelected && isRight ? 'bg-emerald-50/30 border-emerald-100 border-dashed animate-pulse' : ''}
                                                    ${!isSelected && !isRight ? 'bg-gray-50/30 border-transparent' : ''}
                                                `}
                                            >
                                                <div className={`w-2.5 h-2.5 rounded-full
                                                    ${isRight ? 'bg-emerald-500' : isSelected ? 'bg-red-500' : 'bg-gray-200'}`} 
                                                />
                                                <span className={`text-sm font-medium flex-1
                                                    ${isRight ? 'text-emerald-700 font-bold' : isSelected ? 'text-red-700 font-bold' : 'text-gray-500'}`}>
                                                    {opt.text}
                                                </span>
                                                {isRight && (
                                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-lg uppercase tracking-widest">Correct Answer</span>
                                                )}
                                                {isSelected && !isRight && (
                                                    <span className="text-[8px] font-black text-red-600 bg-red-100/50 px-2 py-1 rounded-lg uppercase tracking-widest">Your Choice</span>
                                                )}
                                                {isSelected && isRight && (
                                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-100/50 px-2 py-1 rounded-lg uppercase tracking-widest">Your Correct Choice</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Feedback/Explanation if exists */}
                                {q.answerText && (
                                    <div className="mt-6 flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 ml-14">
                                        <Info className="w-5 h-5 text-gray-400 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Learning Note</p>
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">{q.answerText}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Action */}
            <div className="flex justify-center pt-8">
                <button
                    onClick={() => navigate('/guard/knowledge-record')}
                    className="flex items-center gap-3 px-10 py-4 bg-gray-900 text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-2xl hover:bg-[#d0a868] transition-all shadow-xl shadow-gray-200"
                >
                    <ArrowLeft className="w-4 h-4" /> Return to Records
                </button>
            </div>
        </div>
    );
};

export default GuardQuizReview;
