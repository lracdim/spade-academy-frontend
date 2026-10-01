import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Pause, Play } from 'lucide-react';
import { useAntiSkipVideo } from '../../hooks/useAntiSkipVideo';

interface LessonVideoProps {
    /** Identifies the saved position, so each lesson resumes on its own. */
    lessonId: string;
    src: string;
    onWatched: () => void;
    /** Start playing immediately, used when the previous lesson just finished. */
    autoPlay?: boolean;
}

/** Playback position and furthest point watched, kept per guard and lesson. */
const progressKey = (lessonId: string) => {
    let userId = 'guest';
    try {
        const stored = localStorage.getItem('user');
        if (stored) userId = JSON.parse(stored)?.id ?? 'guest';
    } catch {
        // A malformed user entry just means the position is stored per browser.
    }
    return `lesson_progress_${userId}_${lessonId}`;
};

const readProgress = (lessonId: string): { position: number; furthest: number } => {
    try {
        const raw = localStorage.getItem(progressKey(lessonId));
        if (!raw) return { position: 0, furthest: 0 };
        const parsed = JSON.parse(raw);
        return { position: Number(parsed.position) || 0, furthest: Number(parsed.furthest) || 0 };
    } catch {
        return { position: 0, furthest: 0 };
    }
};

const writeProgress = (lessonId: string, position: number, furthest: number) => {
    try {
        localStorage.setItem(progressKey(lessonId), JSON.stringify({ position, furthest }));
    } catch {
        // Private browsing can refuse writes; resuming is a convenience, not a requirement.
    }
};

const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

/**
 * Lesson player with no seek bar at all: the browser's own controls let a guard
 * drag to the end, so playback is driven by click-to-play with only the elapsed
 * time and a fullscreen button on screen.
 */
const LessonVideo: React.FC<LessonVideoProps> = ({ lessonId, src, onWatched, autoPlay = false }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastSavedRef = useRef(0);
    const { furthestWatched, seedProgress, resetProgress, hasWatchedToEnd } = useAntiSkipVideo(videoRef);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // A refresh or a backgrounded tab should not lose the last few seconds.
    useEffect(() => {
        const save = () => {
            const video = videoRef.current;
            if (video && video.currentTime > 0) writeProgress(lessonId, video.currentTime, furthestWatched());
        };
        window.addEventListener('pagehide', save);
        document.addEventListener('visibilitychange', save);
        return () => {
            save();
            window.removeEventListener('pagehide', save);
            document.removeEventListener('visibilitychange', save);
        };
    }, [lessonId, furthestWatched]);

    // The same element plays every lesson: remounting it would drop the browser
    // out of fullscreen between lessons. Swap the source in place instead.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        resetProgress();
        lastSavedRef.current = 0;
        setCurrentTime(0);
        setDuration(0);
        video.load();
    }, [src, lessonId, resetProgress]);

    // Fullscreen needs its own sizing: letterbox the video instead of filling the
    // screen, or a landscape phone crops the subtitles burned into the picture.
    useEffect(() => {
        const sync = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
        document.addEventListener('fullscreenchange', sync);
        return () => document.removeEventListener('fullscreenchange', sync);
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) video.play().catch(() => undefined);
        else video.pause();
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else containerRef.current?.requestFullscreen();
    };

    return (
        <div
            ref={containerRef}
            className={`relative bg-black group ${isFullscreen
                ? 'w-screen h-screen flex items-center justify-center'
                : 'mb-5 rounded-xl overflow-hidden aspect-video'}`}
        >
            <video
                ref={videoRef}
                src={src}
                // No `controls`: the native bar is what allowed skipping ahead.
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => {
                    setIsPlaying(false);
                    writeProgress(lessonId, videoRef.current?.currentTime ?? 0, furthestWatched());
                }}
                onTimeUpdate={() => {
                    const time = videoRef.current?.currentTime ?? 0;
                    setCurrentTime(time);
                    if (Math.abs(time - lastSavedRef.current) >= 3) {
                        lastSavedRef.current = time;
                        writeProgress(lessonId, time, furthestWatched());
                    }
                }}
                onLoadedMetadata={() => {
                    const video = videoRef.current;
                    if (!video) return;
                    setDuration(video.duration ?? 0);

                    // Pick up where the guard left off, including how much they had
                    // already watched, so resuming is not treated as skipping ahead.
                    const saved = readProgress(lessonId);
                    if (saved.furthest > 0) seedProgress(saved.furthest);
                    if (saved.position > 0 && saved.position < video.duration - 1) {
                        video.currentTime = saved.position;
                        setCurrentTime(saved.position);
                    }

                    // Browsers allow this because the guard already pressed play on
                    // the previous lesson; if they block it, the poster stays put.
                    if (autoPlay) video.play().catch(() => undefined);
                }}
                onEnded={() => {
                    writeProgress(lessonId, 0, furthestWatched());
                    if (hasWatchedToEnd()) onWatched();
                }}
                className="w-full h-full object-contain bg-black cursor-pointer"
            />

            {!isPlaying && (
                <button
                    type="button"
                    onClick={togglePlay}
                    aria-label="Play"
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                    <span className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                    </span>
                </button>
            )}

            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
                <div className="flex items-center gap-3">
                    <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} className="text-white hover:text-[#d0a868] transition-colors">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <span className="font-mono text-xs tracking-wider text-white/90">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>
                <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen" className="text-white hover:text-[#d0a868] transition-colors">
                    <Maximize className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default LessonVideo;
