import React, { useRef } from 'react';
import { useAntiSkipVideo } from '../../hooks/useAntiSkipVideo';

interface LessonVideoProps {
    src: string;
    onWatched: () => void;
}

/** Lesson player that only reports completion after the video was really watched. */
const LessonVideo: React.FC<LessonVideoProps> = ({ src, onWatched }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { hasWatchedToEnd } = useAntiSkipVideo(videoRef);

    return (
        <video
            ref={videoRef}
            src={src}
            controls
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            onEnded={() => { if (hasWatchedToEnd()) onWatched(); }}
            className="w-full rounded-xl bg-black mb-5"
        />
    );
};

export default LessonVideo;
