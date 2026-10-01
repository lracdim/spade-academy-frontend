import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, CheckCircle2, Lock, XCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getModulesByCourse } from '../../api/module';
import type { Module } from '../../api/module';
import { getCourses } from '../../api/course';
import type { Course } from '../../api/course';

type ModuleStage = 'completed' | 'retake' | 'quiz-ready' | 'in-progress' | 'not-started';

/**
 * One definition of where a guard stands in a module, used for the badge, the
 * lock and the button so they can never disagree.
 */
const moduleStage = (module: Module): ModuleStage => {
    if (module.quizPassed) return 'completed';
    if ((module.quizAttempts ?? 0) > 0) return 'retake';

    const contentDone = module.lessonCount > 0
        ? (module.lessonsCompleted ?? 0) >= module.lessonCount
        : Boolean(module.videoWatched);
    if (contentDone) return 'quiz-ready';

    const started = (module.lessonsCompleted ?? 0) > 0 || Boolean(module.videoWatched);
    return started ? 'in-progress' : 'not-started';
};

const STAGE_BADGE: Record<ModuleStage, { label: string; className: string }> = {
    'completed': { label: 'COMPLETED', className: 'text-emerald-500 bg-emerald-50' },
    'retake': { label: 'NOT PASSED - RETAKE QUIZ', className: 'text-red-500 bg-red-50' },
    'quiz-ready': { label: 'READY FOR QUIZ', className: 'text-[#d0a868] bg-[#d0a868]/10' },
    'in-progress': { label: 'IN PROGRESS', className: 'text-[#d0a868] bg-[#d0a868]/10' },
    'not-started': { label: 'READY TO START', className: 'text-[#d0a868] bg-[#d0a868]/10' },
};

/** Whether the watching part of the module (lessons or video) is finished. */
const contentDone = (module: Module) => module.lessonCount > 0
    ? (module.lessonsCompleted ?? 0) >= module.lessonCount
    : Boolean(module.videoWatched);

const STAGE_ACTION: Record<ModuleStage, string> = {
    'completed': 'Review',
    'retake': 'Retake Quiz',
    'quiz-ready': 'Take Quiz',
    'in-progress': 'Continue',
    'not-started': 'Start',
};

const GuardCourseModules: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [modules, setModules] = useState<Module[]>([]);
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseAndModules = async () => {
            if (!courseId) return;
            try {
                setLoading(true);
                // Fetch all courses and find the specific one to get course title
                const allCourses = await getCourses();
                const currentCourse = allCourses.find((c: Course) => c.id === courseId);
                if (currentCourse) {
                    setCourse(currentCourse);
                }

                // Fetch modules for this course
                const moduleData = await getModulesByCourse(courseId);
                const sortedModules = moduleData.sort((a, b) => a.order - b.order);
                setModules(sortedModules);

                // Load progress: prioritize API data, then sync with local storage
                const apiCompleted = {
                    videos: sortedModules.filter(m => m.videoWatched).map(m => m.id),
                    quizzes: sortedModules.filter(m => m.quizPassed).map(m => m.id)
                };


                // Sync with local storage for consistency if needed by other components
                const userObjStr = localStorage.getItem('user');
                const user = userObjStr ? JSON.parse(userObjStr) : null;
                const progressKey = `progress_v2_${user?.id || 'anon'}_${courseId}`;
                localStorage.setItem(progressKey, JSON.stringify(apiCompleted));
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseAndModules();
    }, [courseId]);

    /** A module opens when it is first, the one before it is passed, or the guard already started it. */
    const isModuleUnlocked = (index: number) => {
        if (index === 0) return true;
        if (modules[index - 1].quizPassed) return true;
        return moduleStage(modules[index]) !== 'not-started';
    };

    const openModule = (module: Module) => {
        const stage = moduleStage(module);
        const wantsQuiz = stage === 'retake' || stage === 'quiz-ready';
        if (wantsQuiz) {
            navigate(`/guard/learning-hub/${courseId}/play?module=${module.id}&view=quiz`);
        } else {
            navigate(module.lessonCount > 0
                ? `/guard/learning-hub/${courseId}/modules/${module.id}`
                : `/guard/learning-hub/${courseId}/play?module=${module.id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-500 font-medium tracking-wide">Loading course content...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <p className="text-gray-500 font-medium">Course not found or unavailable.</p>
                <button
                    onClick={() => navigate('/guard/learning-hub')}
                    className="flex items-center gap-2 text-[#d0a868] font-semibold hover:text-[#b8955c] transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back to Learning Hub
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Header section with brand feel */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/guard/learning-hub')}
                        className="p-3 text-gray-400 hover:text-gray-900 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase">{course.title}</h1>
                        <p className="text-[10px] font-bold text-[#d0a868] uppercase tracking-[0.2em] mt-1">{modules.length} Modules in this collection</p>
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="grid grid-cols-1 gap-4">
                {modules.map((module, index) => (
                    <div
                        key={module.id}
                        onClick={() => { if (isModuleUnlocked(index)) openModule(module); }}
                        className="bg-white border border-gray-100 rounded-[2.5rem] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col lg:flex-row items-center gap-8 cursor-pointer hover:border-[#d0a868]/30"
                    >
                        {/* YouTube Style Thumbnail */}
                        <div className="flex-shrink-0 w-full lg:w-72 aspect-video relative rounded-3xl overflow-hidden bg-gray-100 group">
                            <img
                                src="/logo.jpg"
                                alt={module.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* Overlay Status */}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                {(() => {
                                    const isUnlocked = isModuleUnlocked(index);
                                    const stage = moduleStage(module);

                                    if (stage === 'completed') return (
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/90 flex items-center justify-center shadow-lg border border-white/20">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                    );
                                    if (stage === 'retake') return (
                                        <div className="w-12 h-12 rounded-full bg-red-500/90 flex items-center justify-center shadow-lg border border-white/20">
                                            <XCircle className="w-6 h-6 text-white" />
                                        </div>
                                    );
                                    if (isUnlocked) return (
                                        <div className="w-12 h-12 rounded-full bg-[#d0a868]/90 flex items-center justify-center shadow-lg border border-white/20">
                                            <PlayCircle className="w-6 h-6 text-white" />
                                        </div>
                                    );
                                    return (
                                        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center shadow-lg border border-white/10 backdrop-blur-sm">
                                            <Lock className="w-6 h-6 text-white/50" />
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                         <div className="flex-1 space-y-2 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Module {index + 1}</span>
                                {(() => {
                                    if (!isModuleUnlocked(index)) {
                                        return <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md uppercase tracking-wide">LOCKED</span>;
                                    }
                                    const badge = STAGE_BADGE[moduleStage(module)];
                                    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${badge.className}`}>{badge.label}</span>;
                                })()}
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                    {module.title}
                                </h3>
                                {module.description && (
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-2xl line-clamp-2">{module.description}</p>
                                )}
                                {moduleStage(module) === 'retake' && (
                                    <p className="text-red-500 text-xs font-bold leading-relaxed max-w-2xl">
                                        You have not passed this module quiz yet. Your best score is {module.bestScore ?? 0}% and you need {module.passMark ?? 70}% to pass. Please retake the quiz to continue.
                                    </p>
                                )}
                            </div>

                            {/* Module Assets / Summary */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-8 gap-y-4 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${contentDone(module) ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400 group-hover:text-[#d0a868]'}`}>
                                        {contentDone(module) ? <CheckCircle2 className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{module.lessonCount > 0 ? 'Lessons' : 'Video'}</p>
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                            {module.lessonCount > 0
                                                ? `${module.lessonsCompleted ?? 0} of ${module.lessonCount}`
                                                : module.video ? 'Masterclass' : 'Upcoming'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${moduleStage(module) === 'completed' ? 'bg-emerald-50 text-emerald-500' : moduleStage(module) === 'retake' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 group-hover:text-[#d0a868]'}`}>
                                        {moduleStage(module) === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : moduleStage(module) === 'retake' ? <XCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Graded</p>
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                            {moduleStage(module) === 'completed'
                                                ? `Passed ${module.bestScore ?? 0}%`
                                                : moduleStage(module) === 'retake'
                                                    ? `${module.bestScore ?? 0}% - needs ${module.passMark ?? 70}%`
                                                    : 'Final Quiz'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {(() => {
                            const isUnlocked = isModuleUnlocked(index);
                            const stage = moduleStage(module);

                            return (
                                <div className="flex-shrink-0">
                                    {isUnlocked ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModule(module);
                                            }}
                                            className={`px-6 py-3 shadow-xl shadow-gray-200/50 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all hover:shadow-[#d0a868]/20 flex items-center gap-2 ${stage === 'retake' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 hover:bg-[#d0a868]'}`}
                                        >
                                            {STAGE_ACTION[stage]} <ArrowLeft className="w-3 h-3 rotate-180" />
                                        </button>
                                    ) : (
                                        <div className="px-6 py-3 bg-gray-50 text-gray-300 font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-2 border border-gray-100">
                                            Locked <Lock className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                ))}

                {modules.length === 0 && !loading && (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white border border-dashed border-gray-200 rounded-[2.5rem]">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                            <FileText className="w-10 h-10 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-gray-900">No modules available</p>
                            <p className="text-gray-400 text-sm max-w-xs mx-auto">This course content is being prepared. Please check back later.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuardCourseModules;
