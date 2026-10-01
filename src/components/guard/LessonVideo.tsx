import React, { useEffect, useRef, useState } from 'react';
import { Maximize, Pause, Play } from 'lucide-react';
import { useAntiSkipVideo } from '../../hooks/useAntiSkipVideo';

interface LessonVideoProps {
    src: string;
    onWatched: () => void;
    /** Start playing immediately, used when the previous lesson just finished. */
    autoPlay?: boolean;
}

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
const LessonVideo: React.FC<LessonVideoProps> = ({ src, onWatched, autoPlay = false }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { hasWatchedToEnd } = useAntiSkipVideo(videoRef);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

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
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                onLoadedMetadata={() => {
                    setDuration(videoRef.current?.duration ?? 0);
                    // Browsers allow this because the guard already pressed play on
                    // the previous lesson; if they block it, the poster stays put.
                    if (autoPlay) videoRef.current?.play().catch(() => undefined);
                }}
                onEnded={() => { if (hasWatchedToEnd()) onWatched(); }}
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
