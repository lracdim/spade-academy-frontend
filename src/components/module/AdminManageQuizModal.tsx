import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Save, Plus } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { getModuleQuiz, updateModuleQuiz } from '../../api/module';
import type { QuestionPayload, Module } from '../../api/module';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdminManageQuizModalProps {
    moduleItem: Module | null;
    isOpen: boolean;
    onClose: () => void;
}

const AdminManageQuizModal: React.FC<AdminManageQuizModalProps> = ({ moduleItem, isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [questions, setQuestions] = useState<QuestionPayload[]>([]);
    /** Set when the existing quiz could not be read, so saving would wipe questions we never loaded. */
    const [loadFailed, setLoadFailed] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_OR_FALSE',
        answerText: '',
        options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ]
    });

    useEffect(() => {
        const fetchExistingQuiz = async () => {
            if (isOpen && moduleItem) {
                setFetching(true);
                setLoadFailed(false);
                try {
                    const quiz = await getModuleQuiz(moduleItem.id);
                    if (quiz && quiz.questions) {
                        setQuestions(quiz.questions.map(q => ({
                            text: q.text,
                            type: q.type === 'TRUE_FALSE' ? 'TRUE_OR_FALSE' : (q.type as any),
                            options: q.options || [],
                            answerText: q.answerText || ''
                        })));
                    } else {
                        setQuestions([]);
                    }
                } catch (error: any) {
                    if (error?.response?.status !== 404) {
                        // The quiz may well have questions we simply could not read.
                        // Saving now would delete them, so lock saving until a reload succeeds.
                        setLoadFailed(true);
                        toast.error('Failed to load existing quiz');
                    } else {
                        setQuestions([]); // No quiz exists yet
                    }
                } finally {
                    setFetching(false);
                }
            }
        };

        fetchExistingQuiz();
    }, [isOpen, moduleItem]);

    const handleAddQuestion = () => {
        if (!newQuestion.text.trim()) {
            toast.error('Question text is required');
            return;
        }

        let finalOptions = [...newQuestion.options];
        if (newQuestion.type === 'MULTIPLE_CHOICE') {
            if (newQuestion.options.some(opt => !opt.text.trim())) {
                toast.error('All choices must be filled for multiple choice');
                return;
            }
        } else if (newQuestion.type === 'TRUE_OR_FALSE') {
            finalOptions = newQuestion.options.slice(0, 2);
        }

        setQuestions([
            ...questions,
            { text: newQuestion.text, type: newQuestion.type, options: finalOptions, answerText: newQuestion.answerText }
        ]);

        setNewQuestion({
            text: '',
            type: 'MULTIPLE_CHOICE',
            answerText: '',
            options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ]
        });
        toast.success('Question added to quiz list');
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleOptionTextChange = (index: number, text: string) => {
        const updatedOptions = [...newQuestion.options];
        updatedOptions[index].text = text;
        setNewQuestion({ ...newQuestion, options: updatedOptions });
    };

    const handleCorrectOptionChange = (index: number) => {
        const updatedOptions = newQuestion.options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index,
        }));
        setNewQuestion({ ...newQuestion, options: updatedOptions });
    };

    const handleSaveQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleItem) return;

        let finalQuestionsToSave = [...questions];

        // Automatically append the new question being drafted if it has text
        if (newQuestion.text.trim()) {
            let finalOptions = [...newQuestion.options];
            if (newQuestion.type === 'MULTIPLE_CHOICE') {
                if (newQuestion.options.some(opt => !opt.text.trim())) {
                    toast.error('Please fill all choices for the unsaved multiple choice question, or clear the text to ignore it.');
                    return;
                }
            } else if (newQuestion.type === 'TRUE_OR_FALSE') {
                finalOptions = newQuestion.options.slice(0, 2);
            }
            finalQuestionsToSave.push({
                text: newQuestion.text,
                type: newQuestion.type,
                options: finalOptions,
                answerText: newQuestion.answerText
            });
        }

        if (loadFailed) {
            toast.error('The existing quiz could not be loaded. Reopen this dialog before saving, or you would erase its questions.');
            return;
        }

        if (finalQuestionsToSave.length === 0) {
            const confirmed = window.confirm(
                'This will remove every question from this quiz. Guards will see an empty assessment. Continue?'
            );
            if (!confirmed) return;
        }

        setLoading(true);
        try {
            await updateModuleQuiz(moduleItem.id, { questions: finalQuestionsToSave });
            toast.success('Quiz saved successfully');
            onClose();
        } catch (error) {
            console.error('Failed to save quiz:', error);
            toast.error('Failed to save quiz updates');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-[90vh] border-none shadow-2xl scrollbar-hide">
                <DialogHeader className="p-6 border-b border-gray-100 flex-row justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Manage Module Quiz</DialogTitle>
                        <p className="text-sm text-gray-500 mt-1 truncate max-w-[300px]">{moduleItem?.title}</p>
                    </div>
                </DialogHeader>

                {fetching ? (
                    <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <LoadingSpinner size="lg" />
                        <p className="text-sm font-medium text-gray-500">Loading quiz questions...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSaveQuiz} className="p-8 space-y-6 bg-gray-50/50">
                        <div className="space-y-6">

                            {/* List of mapped questions */}
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Saved Questions ({questions.length})</h3>
                                {questions.length > 0 ? (
                                    <div className="space-y-3">
                                        {questions.map((q, qIndex) => (
                                            <div key={qIndex} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm mb-2">{qIndex + 1}. {q.text}</p>
                                                    <ul className="space-y-1 mb-2">
                                                        {q.options.map((opt, oIndex) => (
                                                            <li key={oIndex} className={cn("text-xs font-medium", opt.isCorrect ? "text-indigo-600 font-bold" : "text-gray-500")}>
                                                                • {opt.text} {opt.isCorrect && "(Correct)"}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {q.answerText && (
                                                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                                                            <span className="font-bold">Explanation:</span> {q.answerText}
                                                        </div>
                                                    )}
                                                </div>
                                                <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                                        <p className="text-sm font-bold text-gray-500">No questions added yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Use the form below to create your first question.</p>
                                    </div>
                                )}
                            </div>

                            {/* New Question Form */}
                            <div className="space-y-4 pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Add New Question</h3>
                                <div className="grid grid-cols-1 gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-700 block uppercase tracking-widest">Question Type</Label>
                                        <select
                                            value={newQuestion.type}
                                            onChange={(e) => {
                                                const type = e.target.value as 'MULTIPLE_CHOICE' | 'TRUE_OR_FALSE';
                                                let options = [...newQuestion.options];
                                                if (type === 'TRUE_OR_FALSE') {
                                                    options = [
                                                        { text: 'True', isCorrect: true },
                                                        { text: 'False', isCorrect: false },
                                                        { text: '', isCorrect: false },
                                                        { text: '', isCorrect: false }
                                                    ];
                                                } else if (type === 'MULTIPLE_CHOICE') {
                                                    options = [
                                                        { text: '', isCorrect: true },
                                                        { text: '', isCorrect: false },
                                                        { text: '', isCorrect: false },
                                                        { text: '', isCorrect: false }
                                                    ];
                                                }
                                                setNewQuestion({ ...newQuestion, type, options, answerText: '' });
                                            }}
                                            className="w-full h-11 border border-gray-200 rounded-lg px-4 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-sm font-medium"
                                        >
                                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                            <option value="TRUE_OR_FALSE">True / False</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold text-gray-700 block uppercase tracking-widest">Question Text</Label>
                                        <Input
                                            placeholder="e.g. What is the first step in Patrolling?"
                                            value={newQuestion.text}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                            className="border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg bg-gray-50 text-sm font-medium h-11"
                                        />
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <Label className="text-xs font-semibold text-gray-700 block uppercase tracking-widest">
                                            {newQuestion.type === 'TRUE_OR_FALSE' ? 'Options (Select Correct)' : 'Choices (Select Correct)'}
                                        </Label>

                                        {newQuestion.options.slice(0, newQuestion.type === 'TRUE_OR_FALSE' ? 2 : 4).map((opt, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "flex items-center gap-3 p-2 rounded-lg border-2 cursor-pointer transition-colors",
                                                    opt.isCorrect ? "border-indigo-500 bg-indigo-50/20" : "border-transparent hover:border-gray-200"
                                                )}
                                                onClick={() => handleCorrectOptionChange(index)}
                                            >
                                                <input
                                                    type="radio"
                                                    name="correctOption"
                                                    checked={opt.isCorrect}
                                                    onChange={() => handleCorrectOptionChange(index)}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-600 border-gray-300 ml-2"
                                                />
                                                {newQuestion.type === 'TRUE_OR_FALSE' ? (
                                                    <div className={cn(
                                                        "flex-1 rounded-lg py-2 px-4 transition-colors font-semibold text-sm disabled flex items-center h-11 border",
                                                        opt.isCorrect ? "border-indigo-200 bg-indigo-50/50 text-indigo-700" : "border-gray-200 text-gray-700 bg-gray-50 bg-white"
                                                    )}>
                                                        {opt.text}
                                                    </div>
                                                ) : (
                                                    <Input
                                                        placeholder={`Choice ${index + 1}`}
                                                        value={opt.text}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleOptionTextChange(index, e.target.value);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={cn(
                                                            "flex-1 rounded-lg transition-colors h-11 text-sm font-medium",
                                                            opt.isCorrect ? "border-indigo-300 bg-indigo-50/50 focus:border-indigo-500 focus:ring-indigo-500 text-indigo-900" : "border-gray-200 bg-white focus:border-indigo-500 focus:ring-indigo-500"
                                                        )}
                                                    />
                                                )}
                                                {opt.isCorrect && (
                                                    <span className="text-xs font-bold text-indigo-600 mr-2 uppercase tracking-widest hidden sm:block">Correct</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 mt-2">
                                        <Label className="text-xs font-semibold text-gray-700 block uppercase tracking-widest">Answer Explanation (Optional)</Label>
                                        <Input
                                            placeholder="Type the answer explanation..."
                                            value={newQuestion.answerText}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, answerText: e.target.value })}
                                            className="border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg bg-gray-50 h-11 text-sm font-medium"
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        variant="outline"
                                        className="w-full border-dashed border-2 bg-transparent hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 font-bold transition-all text-gray-600 py-6 mt-4"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Question to List
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-200 sticky bottom-0 bg-gray-50/50 backdrop-blur-md pb-4 pt-4 -mx-8 px-8 -mb-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="h-11 px-6 rounded-xl border-gray-200 font-bold text-sm text-gray-700 hover:bg-white transition-all active:scale-95 shadow-sm bg-white"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-11 px-6 rounded-xl bg-black hover:bg-gray-800 font-bold text-sm text-white transition-all active:scale-95 shadow-lg flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <LoadingSpinner size="sm" showLogo={false} />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save All Questions
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AdminManageQuizModal;
