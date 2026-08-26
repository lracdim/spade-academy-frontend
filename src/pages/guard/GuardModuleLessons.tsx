import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, FileText, PlayCircle } from 'lucide-react';
import { completeLesson, getLessonsByModule, getModulesByCourse, type Lesson, type Module } from '@/api/module';

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
                setCompletedLessonIds(items.filter(item => item.completed).map(item => item.id));
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

    return (
        <div className="max-w-4xl mx-auto space-y-7 pb-20 animate-in fade-in duration-500">
            <button onClick={() => navigate(`/guard/learning-hub/${courseId}`)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" /> Back to modules
            </button>
            <header>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d0a868] mb-2">Course module</p>
                <h1 className="text-3xl font-black text-gray-900">{module.title}</h1>
                <p className="mt-2 text-gray-500">Complete each lesson, then take the module quiz.</p>
            </header>
            <section className="space-y-3">
                {lessons.map((lesson, index) => (
                    <article key={lesson.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <button disabled={!isUnlocked(index)} onClick={() => setOpenLesson(openLesson === lesson.id ? null : lesson.id)} className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50 disabled:opacity-45 disabled:cursor-not-allowed">
                            <span className="w-9 h-9 rounded-full bg-[#d0a868]/10 text-[#9b743d] font-black text-sm flex items-center justify-center">{index + 1}</span>
                            <div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lesson {index + 1}{!isUnlocked(index) ? ' · Locked' : ''}</p><h2 className="font-bold text-gray-900 mt-0.5">{lesson.title}</h2></div>
                            <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${openLesson === lesson.id ? 'rotate-90' : ''}`} />
                        </button>
                        {openLesson === lesson.id && <div className="border-t border-gray-100 px-5 py-6 ml-0 sm:ml-14">
                            {lesson.video && <video src={lesson.video} controls controlsList="nodownload noplaybackrate" disablePictureInPicture onEnded={() => markComplete(lesson.id).catch(console.error)} className="w-full rounded-xl bg-black mb-5" />}
                            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">{lesson.content}</p>
                            {completedLessonIds.includes(lesson.id) && <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Lesson complete</div>}
                        </div>}
                    </article>
                ))}
            </section>
            <button disabled={!allLessonsCompleted} onClick={() => navigate(`/guard/learning-hub/${courseId}/play?module=${moduleId}&view=quiz`)} className="w-full rounded-2xl bg-gray-950 p-5 text-white flex items-center justify-between hover:bg-[#d0a868] disabled:opacity-40 disabled:cursor-not-allowed">
                <span className="flex items-center gap-3 font-black"><FileText className="w-5 h-5" /> Take Module Quiz</span>
                <span className="text-xs font-bold text-white/70">After {lessons.length} lessons <PlayCircle className="w-4 h-4 inline ml-1" /></span>
            </button>
        </div>
    );
};

export default GuardModuleLessons;
