import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { createModule } from '../../api/module';
import type { QuestionPayload } from '../../api/module';
import { uploadFile } from '../../api/upload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreateModuleModalProps {
    courseId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateModuleModal: React.FC<CreateModuleModalProps> = ({ courseId, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        video: '',
    });
    const [loading, setLoading] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);

    const [addQuizzes, setAddQuizzes] = useState(false);
    const [questions, setQuestions] = useState<QuestionPayload[]>([]);
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

    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (1GB = 1024 * 1024 * 1024 bytes)
        const ONE_GB = 1024 * 1024 * 1024;
        if (file.size > ONE_GB) {
            toast.error('Video file size exceeds the 1GB limit');
            if (videoInputRef.current) videoInputRef.current.value = '';
            return;
        }

        setUploadingVideo(true);

        try {
            const { url } = await uploadFile(file);
            setFormData(prev => ({ ...prev, video: url }));
            toast.success('Video uploaded successfully');
        } catch (error: any) {
            console.error('Failed to upload video:', error);
            toast.error(error.message || 'Failed to upload video');
        } finally {
            setUploadingVideo(false);
        }
    };

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
        toast.success('Question added to quiz');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error('Title is required');
            return;
        }

        let finalQuestionsToSave = [...questions];

        if (addQuizzes && newQuestion.text.trim()) {
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

        setLoading(true);
        try {
            await createModule(courseId, {
                title: formData.title,
                description: formData.description || undefined,
                video: formData.video || undefined,
                questions: addQuizzes && finalQuestionsToSave.length > 0 ? finalQuestionsToSave : undefined,
            });
            toast.success('Module created successfully');
            setFormData({ title: '', description: '', video: '' });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create module:', error);
            toast.error('Failed to create module');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-[90vh] border-none shadow-2xl scrollbar-hide">
                <DialogHeader className="p-6 border-b border-gray-100 flex-row justify-between items-center bg-white sticky top-0 z-10">
                    <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">Create New Module</DialogTitle>
                    <DialogDescription className="sr-only">
                        Fill in the details below to create a new module for this course.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Module Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Introduction to Patrolling"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="h-12 border-gray-200 focus:ring-black focus:border-black rounded-xl p-4"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                            <textarea
                                id="description"
                                placeholder="What will guards learn in this module?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full min-h-[120px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 transition-all font-body resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Module Video</Label>
                            <input
                                type="file"
                                ref={videoInputRef}
                                className="hidden"
                                accept="video/*"
                                onChange={handleFileChange}
                            />
                            <div
                                onClick={() => videoInputRef.current?.click()}
                                className={cn(
                                    "border-2 border-dashed rounded-2xl p-1 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative min-h-[140px]",
                                    formData.video ? "border-indigo-100 bg-indigo-50/10" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200"
                                )}
                            >
                                {formData.video ? (
                                    <div className="w-full h-full absolute inset-0">
                                        <video src={formData.video} className="w-full h-full object-cover" muted />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-6 space-y-2">
                                        <div className="p-2 rounded-lg shadow-sm border bg-white border-gray-100 transition-transform group-hover:scale-110">
                                            {uploadingVideo ? (
                                                <LoadingSpinner size="sm" showLogo={false} />
                                            ) : (
                                                <Upload className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-gray-500 group-hover:text-black transition-colors leading-tight">
                                                {uploadingVideo ? 'Uploading...' : 'Click to upload video'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={addQuizzes}
                                    onChange={(e) => setAddQuizzes(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                />
                                <span className="text-sm font-bold text-gray-900">Add Quizzes</span>
                            </label>

                            {addQuizzes && (
                                <div className="mt-6 space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Quiz Questions</h3>

                                    {/* List of mapped questions */}
                                    {questions.length > 0 && (
                                        <div className="space-y-3">
                                            {questions.map((q, qIndex) => (
                                                <div key={qIndex} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm mb-2">{qIndex + 1}. {q.text}</p>
                                                        <ul className="space-y-1 mb-2">
                                                            {q.options.map((opt, oIndex) => (
                                                                <li key={oIndex} className={cn("text-xs font-medium", opt.isCorrect ? "text-[#d0a868]" : "text-gray-500")}>
                                                                    • {opt.text} {opt.isCorrect && "(Correct)"}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {q.answerText && (
                                                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                                                                <span className="font-bold">Answer:</span> {q.answerText}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button onClick={() => handleRemoveQuestion(qIndex)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* New Question Form */}
                                    <div className="space-y-4 pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-gray-700 block">Question Type</Label>
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
                                                    className="w-full h-11 border border-gray-200 rounded-xl px-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                                >
                                                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                                    <option value="TRUE_OR_FALSE">True/False</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-gray-700 block">Question</Label>
                                                <Input
                                                    placeholder="e.g. What is the first step in Patrolling?"
                                                    value={newQuestion.text}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                                    className="border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-gray-700 block">
                                                    {newQuestion.type === 'TRUE_OR_FALSE' ? 'Options (select correct answer)' : 'Choices (select correct answer)'}
                                                </Label>

                                                {newQuestion.options.slice(0, newQuestion.type === 'TRUE_OR_FALSE' ? 2 : 4).map((opt, index) => (
                                                    <div
                                                        key={index}
                                                        className={cn(
                                                            "flex items-center gap-3 p-2 rounded-lg border-2 cursor-pointer transition-colors",
                                                            opt.isCorrect ? "border-[#d0a868] bg-[#d0a868]/10" : "border-transparent hover:border-gray-200"
                                                        )}
                                                        onClick={() => handleCorrectOptionChange(index)}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="correctOption"
                                                            checked={opt.isCorrect}
                                                            onChange={() => handleCorrectOptionChange(index)}
                                                            className="w-4 h-4 text-[#d0a868] focus:ring-[#d0a868] border-gray-300 ml-2"
                                                        />
                                                        {newQuestion.type === 'TRUE_OR_FALSE' ? (
                                                            <div className={cn(
                                                                "flex-1 rounded-lg py-2 px-4 transition-colors font-semibold text-sm disabled flex items-center h-11 border",
                                                                opt.isCorrect ? "border-[#d0a868]/30 bg-[#d0a868]/10 text-[#d0a868]" : "border-gray-200 text-gray-700 bg-white"
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
                                                                    opt.isCorrect ? "border-[#d0a868]/50 bg-[#d0a868]/10 focus:border-[#d0a868] focus:ring-[#d0a868] text-[#9c773f]" : "border-gray-200 bg-white focus:border-[#d0a868] focus:ring-[#d0a868]"
                                                                )}
                                                            />
                                                        )}
                                                        {opt.isCorrect && (
                                                            <span className="text-xs font-bold text-[#d0a868] mr-2 uppercase tracking-widest hidden sm:block">Correct</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-2 mt-4">
                                                <Label className="text-sm font-semibold text-gray-700 block">Answer</Label>
                                                <Input
                                                    placeholder="Type the answer/explanation..."
                                                    value={newQuestion.answerText}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, answerText: e.target.value })}
                                                    className="border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            onClick={handleAddQuestion}
                                            variant="outline"
                                            className="w-full border-dashed border-2 bg-transparent hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 font-bold transition-all text-gray-600 py-6"
                                        >
                                            + Add Quiz
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-11 px-6 rounded-xl border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="h-11 px-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                            disabled={loading}
                        >
                            {loading && <LoadingSpinner size="sm" showLogo={false} className="mr-2" />}
                            Create Module
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateModuleModal;
