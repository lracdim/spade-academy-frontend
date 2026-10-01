import { useCallback, useEffect, useRef } from 'react';

/**
 * Master switch for seek blocking, 1x playback and pause-on-tab-switch.
 * Set to false to lift the rules temporarily (for a demo or a trial run).
 */
export const VIDEO_RULES_ENABLED = true;

/** Small slack so ordinary playback jitter is never mistaken for a seek. */
const SEEK_TOLERANCE_SECONDS = 1;

/**
 * Keeps training videos honest.
 *
 * Guards may rewind freely, but dragging ahead of the furthest point they have
 * actually watched snaps back, so a lesson cannot be completed by scrubbing to
 * the end. Playback speed is pinned to 1x for the same reason, and the video
 * pauses whenever the tab is hidden or the window loses focus.
 */
export function useAntiSkipVideo(videoRef: React.RefObject<HTMLVideoElement | null>) {
    const furthestWatchedRef = useRef(0);

    const furthestWatched = useCallback(() => furthestWatchedRef.current, []);
    const resetProgress = useCallback(() => { furthestWatchedRef.current = 0; }, []);
    /** Restores a previously reached point so resuming a part-watched video is not treated as a skip. */
    const seedProgress = useCallback((seconds: number) => {
        if (Number.isFinite(seconds) && seconds > furthestWatchedRef.current) furthestWatchedRef.current = seconds;
    }, []);

    useEffect(() => {
        if (!VIDEO_RULES_ENABLED) return;
        const video = videoRef.current;
        if (!video) return;

        const clampToWatched = () => {
            if (video.currentTime > furthestWatchedRef.current + SEEK_TOLERANCE_SECONDS) {
                video.currentTime = furthestWatchedRef.current;
            }
        };

        const trackProgress = () => {
            if (video.currentTime <= furthestWatchedRef.current + SEEK_TOLERANCE_SECONDS) {
                furthestWatchedRef.current = Math.max(furthestWatchedRef.current, video.currentTime);
            } else {
                clampToWatched();
            }
        };

        const keepRealtimeSpeed = () => {
            if (video.playbackRate !== 1) video.playbackRate = 1;
        };

        const pausePlayback = () => { if (!video.paused) video.pause(); };
        const pauseWhenHidden = () => { if (document.hidden) pausePlayback(); };
        // Covers playback that *starts* while the page is already in the
        // background, which no visibility change would announce.
        const refusePlayWhileHidden = () => { if (document.hidden) pausePlayback(); };

        video.addEventListener('seeking', clampToWatched);
        video.addEventListener('timeupdate', trackProgress);
        video.addEventListener('ratechange', keepRealtimeSpeed);
        video.addEventListener('play', refusePlayWhileHidden);
        document.addEventListener('visibilitychange', pauseWhenHidden);
        // Older Android browsers only emit the prefixed event.
        document.addEventListener('webkitvisibilitychange', pauseWhenHidden);
        window.addEventListener('blur', pausePlayback);
        window.addEventListener('pagehide', pausePlayback);

        return () => {
            video.removeEventListener('seeking', clampToWatched);
            video.removeEventListener('timeupdate', trackProgress);
            video.removeEventListener('ratechange', keepRealtimeSpeed);
            video.removeEventListener('play', refusePlayWhileHidden);
            document.removeEventListener('visibilitychange', pauseWhenHidden);
            document.removeEventListener('webkitvisibilitychange', pauseWhenHidden);
            window.removeEventListener('blur', pausePlayback);
            window.removeEventListener('pagehide', pausePlayback);
        };
    }, [videoRef]);

    /** True once the guard has actually played through to the end. */
    const hasWatchedToEnd = useCallback(() => {
        if (!VIDEO_RULES_ENABLED) return true;
        const video = videoRef.current;
        if (!video || !Number.isFinite(video.duration)) return false;
        return furthestWatchedRef.current >= video.duration - 2;
    }, [videoRef]);

    return { furthestWatched, resetProgress, seedProgress, hasWatchedToEnd };
}
