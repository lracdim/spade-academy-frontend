import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, Lock, PlayCircle } from 'lucide-react';
import { completeLesson, getLessonsByModule, getModulesByCourse, type Lesson, type Module } from '@/api/module';
import LessonVideo from '@/components/guard/LessonVideo';

const GuardModuleLessons: React.FC = () => {
    const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
    const navigate = useNavigate();
    const [module, setModule] = useState<Module | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [openLesson, setOpenLesson] = useState<string | null>(null);
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

    useEffect(() => {
        if (!courseId || !moduleId) return;
        Promise.all([getModulesByCourse(courseId), getLessonsByModule(moduleId)])
            .then(([modules, items]) => {
                setModule(modules.find(item => item.id === moduleId) ?? null);
                setLessons(items);
                const done = items.filter(item => item.completed).map(item => item.id);
                setCompletedLessonIds(done);
                // Open the first lesson the guard has not finished yet.
                const next = items.find(item => !done.includes(item.id)) ?? items[0];
                setOpenLesson(current => current ?? next?.id ?? null);
            })
            .catch(console.error);
    }, [courseId, moduleId]);

    useEffect(() => {
        if (module && !lessons.length) navigate(`/guard/learning-hub/${courseId}/play?module=${moduleId}`, { replace: true });
    }, [courseId, lessons.length, module, moduleId, navigate]);

    if (!module) return <div className="p-12 text-center text-gray-400">Loading module…</div>;
    if (!lessons.length) return null;

    const allLessonsCompleted = lessons.every(lesson => completedLessonIds.includes(lesson.id));
    const isUnlocked = (index: number) => index === 0 || completedLessonIds.includes(lessons[index - 1].id);
    const markComplete = async (lessonId: string) => {
        await completeLesson(lessonId);
        setCompletedLessonIds(current => current.includes(lessonId) ? current : [...current, lessonId]);
    };

    const activeIndex = lessons.findIndex(lesson => lesson.id === openLesson);
    const activeLesson = activeIndex >= 0 ? lessons[activeIndex] : lessons[0];
    const completedInModule = lessons.filter(lesson => completedLessonIds.includes(lesson.id)).length;

    return (
        // Full-bleed against the layout's own padding, then a flat 25px gutter.
        <div className="w-full -mx-5 px-4 sm:px-[25px] space-y-4 lg:space-y-6 pb-16 animate-in fade-in duration-500">
            <button onClick={() => navigate(`/guard/learning-hub/${courseId}`)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" /> Back to modules
            </button>

            <header>
                <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-[#d0a868] mb-1">Course module</p>
                <h1 className="text-lg lg:text-3xl font-black text-gray-900 leading-tight">{module.title}</h1>
                <p className="mt-1 text-xs lg:text-base text-gray-500">Complete each lesson, then take the module quiz.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 lg:gap-6 items-start">
                {/* Left: the lesson being watched */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 lg:p-5 border-b border-gray-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Lesson {activeIndex >= 0 ? activeIndex + 1 : 1} of {lessons.length}
                        </p>
                        <h2 className="text-sm lg:text-base font-bold text-gray-900 mt-1 leading-snug">{activeLesson?.title}</h2>
                    </div>
                    <div className="p-4 lg:p-5">
                        {activeLesson?.video && (
                            <LessonVideo
                                key={activeLesson.id}
                                src={activeLesson.video}
                                onWatched={() => markComplete(activeLesson.id).catch(console.error)}
                            />
                        )}
                        <p className="whitespace-pre-wrap text-xs lg:text-sm leading-6 lg:leading-7 text-gray-600">{activeLesson?.content}</p>
                        {activeLesson && completedLessonIds.includes(activeLesson.id) && (
                            <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" /> Lesson complete
                            </div>
                        )}
                    </div>
                </section>

                {/* Right: the lesson list */}
                <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden lg:sticky lg:top-4">
                    <div className="p-4 lg:p-5 border-b border-gray-100 flex items-center justify-between gap-3">
                        <h2 className="text-xs lg:text-sm font-black text-gray-900 uppercase tracking-widest">Module lessons</h2>
                        <p className="text-[10px] lg:text-xs font-bold text-[#d0a868] shrink-0">{completedInModule}/{lessons.length}</p>
                    </div>

                    <div className="max-h-[50vh] lg:max-h-[calc(100vh-22rem)] overflow-y-auto p-2 lg:p-3 space-y-1.5 lg:space-y-2">
                        {lessons.map((lesson, index) => {
                            const unlocked = isUnlocked(index);
                            const done = completedLessonIds.includes(lesson.id);
                            const active = lesson.id === activeLesson?.id;
                            return (
                                <button
                                    key={lesson.id}
                                    disabled={!unlocked}
                                    onClick={() => setOpenLesson(lesson.id)}
                                    className={`w-full text-left p-2.5 lg:p-3 rounded-xl border flex items-center gap-3 transition-all
                                        ${active ? 'bg-[#d0a868]/10 border-[#d0a868]' : 'bg-white border-gray-100 hover:border-gray-200'}
                                        ${!unlocked ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span className="w-6 h-6 lg:w-7 lg:h-7 shrink-0 rounded-full bg-[#d0a868]/10 text-[#9b743d] font-black text-[10px] lg:text-xs flex items-center justify-center">
                                        {done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : !unlocked ? <Lock className="w-3.5 h-3.5 text-gray-400" /> : index + 1}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            Lesson {index + 1}{!unlocked ? ' · Locked' : ''}
                                        </span>
                                        <span className={`block text-xs font-bold mt-0.5 ${active ? 'text-[#9b743d]' : 'text-gray-800'}`}>
                                            {lesson.title}
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-2 lg:p-3 border-t border-gray-100">
                        <button
                            disabled={!allLessonsCompleted}
                            onClick={() => navigate(`/guard/learning-hub/${courseId}/play?module=${moduleId}&view=quiz`)}
                            className="w-full rounded-xl bg-gray-950 p-3 lg:p-4 text-white flex items-center justify-between gap-2 hover:bg-[#d0a868] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center gap-2 font-black text-sm"><FileText className="w-4 h-4" /> Take Module Quiz</span>
                            <span className="hidden sm:inline text-[10px] font-bold text-white/70">After {lessons.length} lessons <PlayCircle className="w-3.5 h-3.5 inline ml-1" /></span>
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default GuardModuleLessons;
