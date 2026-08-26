import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, Play, Pause, Maximize, CheckCircle,
    Lock, PlayCircle, FileText, Trophy, ArrowRight,
    Sparkles, Award
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getModulesByCourse } from '../../api/module';
import type { Module } from '../../api/module';
import { getCourses } from '../../api/course';
import type { Course } from '../../api/course';
import GuardQuizPlayer from './GuardQuizPlayer';
import { updateVideoProgress } from '../../api/progress';
import { generateCertificate } from '../../api/dashboard';

// ─────────────────────────────────────────────
// Modal: Go to Next Module
// ─────────────────────────────────────────────
const NextModuleModal: React.FC<{
    currentModuleName: string;
    nextModuleName: string;
    onContinue: () => void;
}> = ({ currentModuleName, nextModuleName, onContinue }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#d0a868]/10 rounded-2xl flex items-center justify-center mb-5">
                    <CheckCircle className="w-8 h-8 text-[#d0a868]" />
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight mb-2">
                    Module Complete!
                </h2>
                <p className="text-sm text-gray-500 font-medium mb-1">You've finished</p>
                <p className="text-sm font-bold text-gray-900 mb-6 px-4">"{currentModuleName}"</p>

                <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Up Next</p>
                    <p className="text-sm font-bold text-gray-800">{nextModuleName}</p>
                </div>

                <button
                    onClick={onContinue}
                    className="w-full py-3.5 bg-[#d0a868] hover:bg-[#b8955c] text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-lg shadow-[#d0a868]/20"
                >
                    Go to Next Module <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Modal: Course Complete + Certificate
// ─────────────────────────────────────────────
const CourseCompleteModal: React.FC<{
    courseName: string;
    isGenerating: boolean;
    certGenerated: boolean;
    certError: string | null;
    onGoToCertificates: () => void;
    onStay: () => void;
}> = ({ courseName, isGenerating, certGenerated, certError, onGoToCertificates, onStay }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">

                {/* Trophy */}
                <div className="w-20 h-20 bg-gradient-to-br from-[#d0a868] to-[#b8955c] rounded-3xl flex items-center justify-center mb-5 shadow-lg shadow-[#d0a868]/30">
                    <Trophy className="w-10 h-10 text-white" />
                </div>

                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-4">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        Training Complete
                    </span>
                </div>

                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                    Congratulations! 🎉
                </h2>
                <p className="text-sm text-gray-500 font-medium mb-1">
                    Thank you for completing
                </p>
                <p className="text-sm font-bold text-gray-900 mb-6 px-2">
                    "{courseName}"
                </p>

                {/* Certificate status card */}
                <div className={`w-full rounded-2xl p-4 mb-6 border transition-all duration-500 ${certError
                        ? 'bg-red-50 border-red-200'
                        : certGenerated
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-gray-50 border-gray-100'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${certError
                                ? 'bg-red-400'
                                : certGenerated
                                    ? 'bg-emerald-500'
                                    : 'bg-[#d0a868]'
                            }`}>
                            {isGenerating ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : certGenerated ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                                <Award className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div className="text-left">
                            <p className={`text-xs font-black uppercase tracking-wider ${certError
                                    ? 'text-red-700'
                                    : certGenerated
                                        ? 'text-emerald-700'
                                        : 'text-gray-700'
                                }`}>
                                {isGenerating
                                    ? 'Generating Your Certificate...'
                                    : certGenerated
                                        ? 'Certificate Generated Successfully!'
                                        : certError
                                            ? 'Certificate Generation Failed'
                                            : 'Preparing Certificate...'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                {isGenerating
                                    ? 'Please wait a moment'
                                    : certGenerated
                                        ? 'Your certificate is ready to download'
                                        : certError
                                            ? certError
                                            : 'This may take a few seconds'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="w-full space-y-3">
                    <button
                        onClick={onGoToCertificates}
                        disabled={isGenerating}
                        className={`w-full py-3.5 font-black rounded-2xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider ${isGenerating
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#d0a868] hover:bg-[#b8955c] text-white shadow-lg shadow-[#d0a868]/20'
                            }`}
                    >
                        <Award className="w-4 h-4" />
                        {isGenerating ? 'Please wait...' : 'View My Certificate'}
                    </button>
                    <button
                        onClick={onStay}
                        className="w-full py-3 text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                        Stay on this page
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const GuardVideoPlayer: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [activeView, setActiveView] = useState<'video' | 'quiz'>('video');

    const [completedPieces, setCompletedPieces] = useState<{ videos: string[], quizzes: string[] }>({
        videos: [],
        quizzes: []
    });

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // ── Modal states ──
    const [showNextModuleModal, setShowNextModuleModal] = useState(false);
    const [showCourseCompleteModal, setShowCourseCompleteModal] = useState(false);
    const [isGeneratingCert, setIsGeneratingCert] = useState(false);
    const [certGenerated, setCertGenerated] = useState(false);
    const [certError, setCertError] = useState<string | null>(null);

    const activeModule = modules[activeModuleIndex];

    // Refs to avoid stale closures
    const activeModuleRef = useRef(activeModule);
    useEffect(() => {
        activeModuleRef.current = activeModule;
    }, [activeModule]);

    // ✅ Tab/window visibility pause
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                videoRef.current?.pause();
                setIsPlaying(false);
            }
        };
        const handleBlur = () => {
            videoRef.current?.pause();
            setIsPlaying(false);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    // ✅ Heartbeat sync
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        let isActive = true;

        const sync = () => {
            const mod = activeModuleRef.current;
            if (videoRef.current && mod && isActive) {
                const pos = videoRef.current.currentTime;
                const dur = videoRef.current.duration;
                updateVideoProgress(mod.id, pos, dur, false)
                    .catch(err => console.error('[Heartbeat] Sync failed:', err));
            }
        };

        if (isPlaying && activeModule) {
            sync();
            interval = setInterval(sync, 5000);
        }

        return () => {
            isActive = false;
            if (interval) {
                clearInterval(interval);
                sync();
            }
        };
    }, [isPlaying, activeModule?.id]);

    // ✅ Fetch course data
    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;
            try {
                setLoading(true);
                const allCourses = await getCourses();
                const currentCourse = allCourses.find(c => c.id === courseId);
                if (currentCourse) setCourse(currentCourse);

                const moduleData = await getModulesByCourse(courseId);
                const sortedModules = moduleData.sort((a, b) => a.order - b.order);
                setModules(sortedModules);

                const backendCompleted = {
                    videos: sortedModules.filter(m => m.videoWatched).map(m => m.id),
                    quizzes: sortedModules.filter(m => m.quizPassed).map(m => m.id)
                };
                setCompletedPieces(backendCompleted);

                let startIdx = 0;
                let startView: 'video' | 'quiz' = 'video';
                const requestedModule = searchParams.get('module');
                const requestedIndex = sortedModules.findIndex(module => module.id === requestedModule);
                if (requestedIndex >= 0) {
                    startIdx = requestedIndex;
                    startView = searchParams.get('view') === 'quiz' ? 'quiz' : 'video';
                } else {
                for (let i = 0; i < sortedModules.length; i++) {
                    const mod = sortedModules[i];
                    if (!backendCompleted.videos.includes(mod.id)) {
                        startIdx = i; startView = 'video'; break;
                    }
                    if (!backendCompleted.quizzes.includes(mod.id)) {
                        startIdx = i; startView = 'quiz'; break;
                    }
                }
                }

                setActiveModuleIndex(startIdx);
                setActiveView(startView);
            } catch (error) {
                console.error('Error fetching data for player:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [courseId, searchParams]);

    // ✅ Resume video position
    useEffect(() => {
        if (activeView === 'video' && activeModule && videoRef.current) {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user?.id || 'guest';
            const savedPos = localStorage.getItem(`video_pos_${userId}_${activeModule.id}`);
            if (savedPos) videoRef.current.currentTime = parseFloat(savedPos);
        }
    }, [activeModule?.id, activeView]);

    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds)) return "00:00";
        const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
        const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const toggleFullscreen = () => {
        if (playerContainerRef.current) {
            if (document.fullscreenElement) document.exitFullscreen();
            else playerContainerRef.current.requestFullscreen();
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            setCurrentTime(time);
            if (activeModule && duration > 5) {
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const userId = user?.id || 'guest';
                localStorage.setItem(`video_pos_${userId}_${activeModule.id}`, time.toString());
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsPlaying(false);
        }
    };

    const markVideoAsWatched = async () => {
        const currentMod = modules[activeModuleIndex];
        if (!currentMod || completedPieces.videos.includes(currentMod.id)) return;
        try {
            await updateVideoProgress(currentMod.id, duration, duration, true);
            const newCompleted = { ...completedPieces };
            if (!newCompleted.videos.includes(currentMod.id)) {
                newCompleted.videos = [...newCompleted.videos, currentMod.id];
            }
            setCompletedPieces(newCompleted);
            const userObjStr = localStorage.getItem('user');
            const user = userObjStr ? JSON.parse(userObjStr) : null;
            const progressKey = `progress_v2_${user?.id || 'anon'}_${courseId}`;
            localStorage.setItem(progressKey, JSON.stringify(newCompleted));
        } catch (error) {
            console.error('Error marking video as watched:', error);
        }
    };

    const handleVideoEnd = () => {
        setIsPlaying(false);
        const currentMod = modules[activeModuleIndex];
        if (!currentMod) return;
        const userObjStr = localStorage.getItem('user');
        const user = userObjStr ? JSON.parse(userObjStr) : null;
        const userId = user?.id || 'guest';
        localStorage.removeItem(`video_pos_${userId}_${currentMod.id}`);
        markVideoAsWatched();
        setActiveView('quiz');
    };

    // ✅ Certificate generation helper
    const triggerCertificateGeneration = async () => {
        if (!courseId) return;
        setIsGeneratingCert(true);
        setCertError(null);
        try {
            await generateCertificate(courseId);
            setCertGenerated(true);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Could not generate certificate.';
            setCertError(msg);
            console.error('[Certificate] Auto-generation failed:', msg);
        } finally {
            setIsGeneratingCert(false);
        }
    };

    // ✅ Core: handle quiz completion with modal logic
    const handleQuizFinish = () => {
        const currentMod = modules[activeModuleIndex];
        if (!currentMod) return;

        const userObjStr = localStorage.getItem('user');
        const user = userObjStr ? JSON.parse(userObjStr) : null;
        const progressKey = `progress_v2_${user?.id || 'anon'}_${courseId}`;

        const newCompleted = { ...completedPieces };
        if (!newCompleted.quizzes.includes(currentMod.id)) {
            newCompleted.quizzes = [...newCompleted.quizzes, currentMod.id];
        }
        if (!newCompleted.videos.includes(currentMod.id)) {
            newCompleted.videos = [...newCompleted.videos, currentMod.id];
        }
        setCompletedPieces(newCompleted);
        localStorage.setItem(progressKey, JSON.stringify(newCompleted));

        const isLastModule = activeModuleIndex + 1 >= modules.length;

        if (isLastModule) {
            // ✅ Show course complete modal + auto-generate certificate
            setShowCourseCompleteModal(true);
            triggerCertificateGeneration();
        } else {
            // ✅ Show next module modal
            setShowNextModuleModal(true);
        }
    };

    // ✅ User clicks "Go to Next Module" in modal
    const handleProceedToNextModule = () => {
        setShowNextModuleModal(false);
        setActiveModuleIndex(prev => prev + 1);
        setActiveView('video');
    };

    // ✅ User clicks "View My Certificate"
    const handleGoToCertificates = () => {
        setShowCourseCompleteModal(false);
        navigate('/guard/certificates');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-500 font-medium">Loading Learning Environment...</p>
            </div>
        );
    }

    return (
        <>
            {/* ── Next Module Modal ── */}
            {showNextModuleModal && (
                <NextModuleModal
                    currentModuleName={modules[activeModuleIndex]?.title || 'Module'}
                    nextModuleName={modules[activeModuleIndex + 1]?.title || 'Next Module'}
                    onContinue={handleProceedToNextModule}
                />
            )}

            {/* ── Course Complete Modal ── */}
            {showCourseCompleteModal && (
                <CourseCompleteModal
                    courseName={course?.title || 'this course'}
                    isGenerating={isGeneratingCert}
                    certGenerated={certGenerated}
                    certError={certError}
                    onGoToCertificates={handleGoToCertificates}
                    onStay={() => setShowCourseCompleteModal(false)}
                />
            )}

            <div className="w-full h-[var(--main-height,calc(100vh-6rem))] flex flex-col md:flex-row bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                {/* Left Side: Viewer */}
                <div className="flex-1 flex flex-col bg-black relative">
                    <div className="absolute top-4 left-4 z-20">
                        <button
                            onClick={() => navigate(`/guard/learning-hub/${courseId}`)}
                            className="flex items-center gap-2 bg-black/60 hover:bg-black text-white px-4 py-2 rounded-lg backdrop-blur text-sm font-semibold transition"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Course
                        </button>
                    </div>

                    {activeView === 'quiz' ? (
                        <GuardQuizPlayer moduleId={activeModule?.id || ''} onFinish={handleQuizFinish} />
                    ) : activeModule && activeModule.video ? (
                        <div ref={playerContainerRef} className="relative flex-1 flex flex-col group">
                            <video
                                ref={videoRef}
                                src={activeModule.video}
                                className="w-full h-full object-contain bg-black"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={handleVideoEnd}
                                onClick={togglePlayPause}
                                controlsList="nodownload noplaybackrate"
                                disablePictureInPicture
                            >
                                Your browser does not support HTML5 video.
                            </video>

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
                                <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 relative overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 bottom-0 bg-[#d0a868] rounded-full"
                                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={togglePlayPause}
                                            className="text-white hover:text-[#d0a868] transition transform hover:scale-110"
                                        >
                                            {isPlaying
                                                ? <Pause className="w-8 h-8" />
                                                : <Play className="w-8 h-8 fill-current" />}
                                        </button>
                                        <div className="text-white/80 font-mono text-sm tracking-wider">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </div>
                                    </div>
                                    <button onClick={toggleFullscreen} className="text-white hover:text-[#d0a868] transition">
                                        <Maximize className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {!isPlaying && currentTime < duration && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                                        <Play className="w-10 h-10 text-white fill-current ml-1" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-900">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                <PlayCircle className="w-10 h-10 text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {activeModule ? activeModule.title : 'Select a Module'}
                            </h2>
                            <p className="text-gray-400 max-w-sm">
                                {activeModule
                                    ? 'This module does not contain video content. Proceed to the quiz.'
                                    : 'Loading module content...'}
                            </p>
                            <button
                                onClick={handleVideoEnd}
                                className="mt-8 px-6 py-2.5 bg-[#d0a868] hover:bg-[#b8955c] text-white font-semibold rounded-lg transition"
                            >
                                Mark as Complete & Next
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Side: Curriculum */}
                <div className="w-full md:w-80 lg:w-96 bg-white border-l border-gray-100 flex flex-col h-full z-10">
                    <div className="p-6 border-b border-gray-100 shadow-sm flex-shrink-0">
                        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2">{course?.title}</h2>
                        <p className="text-sm font-medium text-[#d0a868]">Course Curriculum</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                        {modules.map((mod, index) => {
                            const isVideoUnlocked = index === 0 || completedPieces.quizzes.includes(modules[index - 1].id);
                            const isVideoCompleted = completedPieces.videos.includes(mod.id);
                            const isVideoActive = index === activeModuleIndex && activeView === 'video';
                            const isQuizUnlocked = isVideoCompleted || (index === activeModuleIndex && activeView === 'quiz');
                            const isQuizCompleted = completedPieces.quizzes.includes(mod.id);
                            const isQuizActive = index === activeModuleIndex && activeView === 'quiz';

                            return (
                                <div key={mod.id} className="space-y-3">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center justify-between">
                                        <span>Module {index + 1}</span>
                                        {isQuizCompleted && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                                    </h3>
                                    <div className="space-y-2">
                                        {/* Video Item */}
                                        <div
                                            onClick={() => isVideoUnlocked && (setActiveModuleIndex(index), setActiveView('video'))}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                                                ${isVideoActive ? 'bg-[#d0a868]/10 border-[#d0a868] shadow-sm' : 'bg-white border-gray-50 hover:border-gray-200'}
                                                ${!isVideoUnlocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex-shrink-0">
                                                {isVideoCompleted ? (
                                                    <div className="w-5 h-5 rounded-full bg-[#d0a868] flex items-center justify-center">
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                    </div>
                                                ) : !isVideoUnlocked ? (
                                                    <Lock className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <div className={`w-5 h-5 rounded-full border-2 ${isVideoActive ? 'border-[#d0a868]' : 'border-gray-200'}`} />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-xs font-bold truncate ${isVideoActive ? 'text-[#d0a868]' : 'text-gray-700'}`}>
                                                    {mod.title}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <PlayCircle className="w-3 h-3 text-gray-400" />
                                                    <span className="text-[10px] text-gray-500 font-medium">Video Lesson</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quiz Item */}
                                        <div
                                            onClick={() => isQuizUnlocked && (setActiveModuleIndex(index), setActiveView('quiz'))}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                                                ${isQuizActive ? 'bg-[#d0a868]/10 border-[#d0a868] shadow-sm' : 'bg-white border-gray-50 hover:border-gray-200'}
                                                ${!isQuizUnlocked ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <div className="flex-shrink-0">
                                                {isQuizCompleted ? (
                                                    <div className="w-5 h-5 rounded-full bg-[#d0a868] flex items-center justify-center">
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                    </div>
                                                ) : !isQuizUnlocked ? (
                                                    <Lock className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <div className={`w-5 h-5 rounded-full border-2 ${isQuizActive ? 'border-[#d0a868]' : 'border-gray-200'}`} />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-xs font-bold truncate ${isQuizActive ? 'text-[#d0a868]' : 'text-gray-700'}`}>
                                                    Assessment Quiz
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <FileText className="w-3 h-3 text-gray-400" />
                                                    <span className="text-[10px] text-gray-500 font-medium">Graded Test</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default GuardVideoPlayer;
