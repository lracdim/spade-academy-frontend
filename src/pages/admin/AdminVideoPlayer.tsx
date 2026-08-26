import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Maximize, PlayCircle, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getModulesByCourse } from '../../api/module';
import type { Module } from '../../api/module';
import { getCourses } from '../../api/course';
import type { Course } from '../../api/course';

const AdminVideoPlayer: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [activeView, setActiveView] = useState<'video' | 'quiz'>('video');



    // Video player state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;
            try {
                setLoading(true);
                // Fetch course info
                const allCourses = await getCourses();
                const currentCourse = allCourses.find(c => c.id === courseId);
                if (currentCourse) setCourse(currentCourse);

                // Fetch modules
                const moduleData = await getModulesByCourse(courseId);
                const sortedModules = moduleData.sort((a, b) => a.order - b.order);
                setModules(sortedModules);
                setActiveModuleIndex(0);

            } catch (error) {
                console.error('Error fetching data for player:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId]);

    // Format time for display (e.g., 01:23)
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
        if (videoRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setCurrentTime(0);
            setIsPlaying(false); // Autoplay usually blocked, require manual interaction
        }
    };

    const handleVideoEnd = () => {
        setIsPlaying(false);
        // Admin preview: optionally auto-advance, but don't save progress
        if (activeModuleIndex + 1 < modules.length) {
            setActiveModuleIndex(activeModuleIndex + 1);
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-gray-500 font-medium">Loading Learning Environment...</p>
            </div>
        );
    }

    const activeModule = modules[activeModuleIndex];

    return (
        <div className="w-full h-[var(--main-height,calc(100vh-6rem))] flex flex-col md:flex-row bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">
            {/* Left Side: Video Player */}
            <div className="flex-1 flex flex-col bg-black relative">
                <div className="absolute top-4 left-4 z-20">
                    <button
                        onClick={() => navigate(`/admin/courses/${courseId}/modules`)}
                        className="flex items-center gap-2 bg-black/60 hover:bg-black text-white px-4 py-2 rounded-lg backdrop-blur text-sm font-semibold transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Course
                    </button>
                </div>

                {activeView === 'quiz' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl w-full text-center space-y-6">
                            <div className="w-20 h-20 bg-[#d0a868]/10 rounded-full flex items-center justify-center mx-auto">
                                <FileText className="w-10 h-10 text-[#d0a868]" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">{activeModule?.title} - Assessment Quiz</h2>
                            <p className="text-gray-500">Test your knowledge on the content covered in this module.</p>

                            <div className="pt-8">
                                <button className="px-8 py-3 bg-[#d0a868] hover:bg-[#b8955c] text-white font-bold rounded-xl transition-all shadow-md active:scale-95">
                                    Start Quiz Now
                                </button>
                            </div>
                        </div>
                    </div>
                ) : activeModule && activeModule.video ? (
                    <div className="relative flex-1 flex flex-col group">
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

                        {/* Custom Controls Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">

                            {/* Unseekable Progress Bar */}
                            <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 relative overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 bottom-0 bg-[#d0a868] rounded-full"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={togglePlayPause}
                                        className="text-white hover:text-[#d0a868] transition transform hover:scale-110"
                                    >
                                        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current" />}
                                    </button>

                                    <div className="text-white/80 font-mono text-sm tracking-wider">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={toggleFullscreen}
                                        className="text-white hover:text-[#d0a868] transition"
                                    >
                                        <Maximize className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Big Play overlay when paused */}
                        {!isPlaying && currentTime < duration && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
                                    <Play className="w-10 h-10 text-white fill-current ml-1" />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-900 border-b md:border-b-0 md:border-r border-gray-800">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <PlayCircle className="w-10 h-10 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{activeModule ? activeModule.title : 'Select a Module'}</h2>
                        <p className="text-gray-400 max-w-sm">
                            {activeModule ? 'This module does not contain video content. Please review the text materials or proceed to the quiz.' : 'Loading module content...'}
                        </p>

                        <button
                            onClick={handleVideoEnd} // Auto advance if no video
                            className="mt-8 px-6 py-2.5 bg-[#d0a868] hover:bg-[#b8955c] text-white font-semibold rounded-lg transition"
                        >
                            Mark as Complete & Next
                        </button>
                    </div>
                )}
            </div>

            {/* Right Side: Sidebar Curriculum */}
            <div className="w-full md:w-80 lg:w-96 bg-white border-l border-gray-100 flex flex-col h-full z-10">
                <div className="p-6 border-b border-gray-100 shadow-sm z-10 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-900 leading-tight mb-2">{course?.title}</h2>
                    <p className="text-sm font-medium text-[#d0a868]">Course Curriculum</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {modules.map((mod, index) => {
                        const isVideoActive = index === activeModuleIndex && activeView === 'video';
                        const isQuizActive = index === activeModuleIndex && activeView === 'quiz';

                        return (
                            <div key={mod.id} className="space-y-2">
                                {/* Video Card */}
                                <div
                                    onClick={() => {
                                        setActiveModuleIndex(index);
                                        setActiveView('video');
                                    }}
                                    className={`
                                        flex flex-col p-4 rounded-xl border transition-all cursor-pointer
                                        ${isVideoActive ? 'bg-[#d0a868]/10 border-[#d0a868] shadow-inner' : 'bg-white border-gray-100 hover:border-[#d0a868]/50'}
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-0.5 flex-shrink-0">
                                            <div className={`w-5 h-5 rounded-full border-2 ${isVideoActive ? 'border-[#d0a868] bg-white' : 'border-gray-300'}`}>
                                                {isVideoActive && <div className="w-2.5 h-2.5 bg-[#d0a868] rounded-full m-0.5"></div>}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Module {index + 1} - Video</p>
                                            <h4 className={`text-sm font-bold truncate ${isVideoActive ? 'text-[#d0a868]' : 'text-gray-900'}`}>{mod.title}</h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <PlayCircle className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-xs text-gray-500">{mod.video ? 'Video Lesson' : 'Text Lesson'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quiz Card */}
                                <div
                                    onClick={() => {
                                        setActiveModuleIndex(index);
                                        setActiveView('quiz');
                                    }}
                                    className={`
                                        flex flex-col p-4 rounded-xl border transition-all cursor-pointer
                                        ${isQuizActive ? 'bg-[#d0a868]/10 border-[#d0a868] shadow-inner' : 'bg-white border-gray-100 hover:border-[#d0a868]/50'}
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-0.5 flex-shrink-0">
                                            <div className={`w-5 h-5 rounded-full border-2 ${isQuizActive ? 'border-[#d0a868] bg-white' : 'border-gray-300'}`}>
                                                {isQuizActive && <div className="w-2.5 h-2.5 bg-[#d0a868] rounded-full m-0.5"></div>}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Module {index + 1} - Knowledge</p>
                                            <h4 className={`text-sm font-bold truncate ${isQuizActive ? 'text-[#d0a868]' : 'text-gray-900'}`}>Assessment Quiz</h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <FileText className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-xs text-gray-500">Graded Test</span>
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
    );
};

export default AdminVideoPlayer;
