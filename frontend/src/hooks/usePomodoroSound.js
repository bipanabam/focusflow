import { useRef } from "react";

export const usePomodoroSound = () => {
    const soundsRef = useRef(null);
    const unlockedRef = useRef(false);

    if (!soundsRef.current) {
        soundsRef.current = {
            focus: new Audio("/sounds/focus-complete.wav"),
            break: new Audio("/sounds/break-complete.wav"),
        };

        Object.values(soundsRef.current).forEach(a => {
            a.volume = 0.6;
            a.preload = "auto";
        });
    }

    const unlock = () => {
        if (unlockedRef.current) return;
        unlockedRef.current = true;

        Object.values(soundsRef.current).forEach(a => {
            a.muted = true;
            a.play().then(() => {
                a.pause();
                a.currentTime = 0;
                a.muted = false;
            }).catch(() => { });
        });
    };

    const playFocusComplete = () => {
        const a = soundsRef.current.focus;
        a.currentTime = 0;
        a.play().catch(() => { });
    };

    const playBreakComplete = () => {
        const a = soundsRef.current.break;
        a.currentTime = 0;
        a.play().catch(() => { });
    };

    return { unlock, playFocusComplete, playBreakComplete };
};
