import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getModuleQuiz, submitModuleQuiz } from '../../api/module';
import type { Quiz } from '../../api/module';

interface GuardQuizPlayerProps {
    moduleId: string;
    onFinish: () => void;
}

const GuardQuizPlayer: React.FC<GuardQuizPlayerProps> = ({ moduleId, onFinish }) => {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [started, setStarted] = useState(false);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);

    const [showResults, setShowResults] = useState(false);
    const [passed, setPassed] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const data = await getModuleQuiz(moduleId);
                setQuiz({
                    ...data,
                    questions: data.questions?.map(q => ({
                        ...q,
                        options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || [])
                    }))
                });
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setError('No assessment assigned to this module.');
                } else {
                    setError('Failed to load assessment. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (moduleId) {
            fetchQuiz();
            setStarted(false);
            setShowResults(false);
            setAnswers({});
        }
    }, [moduleId]);

    const handleOptionSelect = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        if (!quiz || !quiz.questions) return;
        try {
            setSubmitting(true);
            let correctCount = 0;
            quiz.questions.forEach(q => {
                const isCorrect = q.options.find((opt: any) => opt.text === answers[q.id])?.isCorrect;
                if (isCorrect) correctCount++;
            });
            const calculatedScore = Math.round((correctCount / quiz.questions.length) * 100);
            await submitModuleQuiz(moduleId, { score: calculatedScore, passed: true, answers });
            setPassed(true);
            setShowResults(true);
        } catch (err) {
            console.error('Error submitting quiz', err);
            alert('Failed to submit quiz. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-500 font-medium">Loading Assessment...</p>
            </div>
        );
    }

    if (error || !quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-gray-100 p-8 rounded-2xl w-full max-w-lg">
                    <p className="text-gray-500 mb-6">{error || 'No questions available for this module.'}</p>
                    <button
                        onClick={onFinish}
                        className="px-6 py-2 bg-[#d0a868] text-white rounded-lg hover:bg-[#b8955c] transition"
                    >
                        Mark as Complete & Continue
                    </button>
                </div>
            </div>
        );
    }

    // ✅ Results screen — just shows pass/fail, button calls onFinish()
    // GuardVideoPlayer handles modal logic from here
    if (showResults) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 w-full h-full overflow-y-auto">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl w-full text-center space-y-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${passed ? 'bg-[#d0a868]/20' : 'bg-red-100'
                        }`}>
                        {passed
                            ? <CheckCircle className="w-12 h-12 text-[#d0a868]" />
                            : <XCircle className="w-12 h-12 text-red-600" />}
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {passed ? 'Assessment Passed!' : 'Assessment Complete'}
                        </h2>
                        <p className="text-gray-500">
                            {passed
                                ? 'Great work! You have successfully completed this module.'
                                : 'Thank you for completing the assessment.'}
                        </p>
                    </div>

                    {/* ✅ Single button — triggers modal in GuardVideoPlayer */}
                    <button
                        onClick={onFinish}
                        className="w-full py-4 bg-[#d0a868] hover:bg-[#b8955c] text-white font-bold rounded-xl transition shadow-md"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 w-full h-full">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-[#d0a868]/10 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl font-bold text-[#d0a868]">{quiz.questions.length}</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Module Assessment</h2>
                        <p className="text-gray-500">
                            This quiz contains {quiz.questions.length} questions. You need a score of {quiz.passMark}% to pass.
                        </p>
                    </div>
                    <div className="pt-8">
                        <button
                            onClick={() => setStarted(true)}
                            className="px-8 py-3 bg-[#d0a868] hover:bg-[#b8955c] text-white font-bold rounded-xl transition shadow-md w-full max-w-md"
                        >
                            Start Quiz Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-white text-left w-full">
            <div className="max-w-3xl mx-auto space-y-12 pb-24">
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Module Assessment</h2>
                    <p className="text-gray-500">Answer all questions to complete the module.</p>
                </div>

                <div className="space-y-12">
                    {quiz.questions.map((q, idx) => (
                        <div key={q.id} className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                <span className="text-[#d0a868] mr-2">{idx + 1}.</span>
                                {q.text}
                            </h3>
                            <div className="space-y-3 pl-6">
                                {q.options && Array.isArray(q.options) && q.options.map((opt: any, optIdx: number) => (
                                    <label
                                        key={optIdx}
                                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition
                                            ${answers[q.id] === opt.text
                                                ? 'bg-[#d0a868]/5 border-[#d0a868] ring-1 ring-[#d0a868]'
                                                : 'hover:bg-gray-50 border-gray-200'}`}
                                    >
                                        <div className="flex items-center h-6">
                                            <input
                                                type="radio"
                                                name={`question-${q.id}`}
                                                checked={answers[q.id] === opt.text}
                                                onChange={() => handleOptionSelect(q.id, opt.text)}
                                                className="w-5 h-5 text-[#d0a868] border-gray-300 focus:ring-[#d0a868]"
                                            />
                                        </div>
                                        <span className="text-gray-700 leading-relaxed font-medium">{opt.text}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length < quiz.questions.length}
                        className={`w-full md:w-auto px-8 py-3 font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2
                            ${submitting || Object.keys(answers).length < quiz.questions.length
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-[#d0a868] hover:bg-[#b8955c] text-white'}`}
                    >
                        {submitting && <LoadingSpinner size="sm" className="mr-2" showLogo={false} />}
                        Submit Answers
                    </button>
                    {Object.keys(answers).length < quiz.questions.length && (
                        <p className="text-sm text-red-500 mt-3">Please answer all questions before submitting.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuardQuizPlayer;