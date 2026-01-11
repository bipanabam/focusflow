import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePomodoroSocket } from "../hooks/usePomodoroSocket";
import { IoPlayOutline, IoPauseCircle, IoStopCircle } from "react-icons/io5";
import { useAuth } from "../contexts/AuthContext";
import { startTask, resumeTask, pauseTask, completeTask, getActiveSession } from "../api/apiEndpoints";

import { FSM, RUNNING_STATES, PAUSED_STATES } from "../constants/fsm";
import { gradientByState } from "../constants/taskUI";
import { usePomodoroSound } from "../hooks/usePomodoroSound";

const CurrentTaskTimer = ({ task, session, onSessionEnded }) => {
    // Determine initial time
    const { user } = useAuth();

    const DEFAULT_FOCUS_MINUTES = user?.pomodoro_settings?.focus_minutes || 25;

    const getInitialTime = () => {
        if (session) {
            // Use remaining seconds if provided, else compute
            if (session.remaining_seconds !== undefined) return session.remaining_seconds;

            const startedAt = new Date(session.started_at).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startedAt) / 1000);
            const paused = session.paused_seconds || 0;

            return Math.max(session.total_duration_seconds - elapsed - paused, 0);
        }

        if (task?.estimated_pomodoros) {
            const focusMinutes = user?.pomodoro_settings?.focus_minutes || DEFAULT_FOCUS_MINUTES;
            return task.estimated_pomodoros * focusMinutes * 60;
        }

        return (user?.pomodoro_settings?.focus_minutes || DEFAULT_FOCUS_MINUTES) * 60;
    };

    const [timeLeft, setTimeLeft] = useState(getInitialTime());
    const [totalDuration, setTotalDuration] = useState(getInitialTime());

    const [sessionState, setSessionState] = useState(FSM.IDLE);
    const [pending, setPending] = useState(false);

    const timerRef = useRef(null);

    const isIdle = sessionState === FSM.IDLE;
    const isTerminated = sessionState === FSM.TERMINATED;

    const showEndButton = sessionState.startsWith("FOCUS");
    const { isRunning, isPaused, isBreak } = useMemo(() => ({
        isRunning: RUNNING_STATES.includes(sessionState),
        isPaused: PAUSED_STATES.includes(sessionState),
        isBreak: sessionState.startsWith("BREAK"),
    }), [sessionState]);

    const { unlock, playFocusComplete, playBreakComplete } = usePomodoroSound();

    const [beat, setBeat] = useState(false);
    const prevStateRef = useRef(null);

    const trackEvent = (name, payload = {}) => {
        console.log(`[EVENT] ${name}`, payload);
    };

    // Reset when task changes
    useEffect(() => {
        if (!task?.id) return;

        // Only initialize if there is NO session
        if (!session) {
            const initialTime = task?.estimated_pomodoros
                ? task.estimated_pomodoros * 25 * 60
                : DEFAULT_FOCUS_MINUTES * 60;

            setSessionState(FSM.IDLE);
            setTimeLeft(initialTime);
            setTotalDuration(initialTime);
        }
    }, [task?.id, session]);


    // hydrate
    useEffect(() => {
        if (!task?.id) return;

        (async () => {
            const data = await getActiveSession(task.id);
            if (!data?.fsm_state) return;

            applySessionUpdate({
                fsmState: data.fsm_state,
                session: data,
            });
        })();
    }, [task?.id]);

    // Track session state changes
    useEffect(() => {
        trackEvent("pomodoro_state_changed", { state: sessionState });
    }, [sessionState]);

    // helper
    const applySessionUpdate = ({ fsmState, session }) => {
        setSessionState(fsmState);

        if (session?.remaining_seconds !== undefined) {
            setTimeLeft(session.remaining_seconds);
            setTotalDuration(session.total_duration_seconds);
        }

        if (fsmState === FSM.TERMINATED) {
            setTimeLeft(0);
        }
    };

    // WebSocket updates
    usePomodoroSocket((payload) => {
        if (payload.session.task_id !== task?.id) return;
        if (payload.ended || payload.fsm_state === "TERMINATED") {
            setSessionState(FSM.TERMINATED);
            setTimeLeft(0);
            return; // Stop further updates
        }
        applySessionUpdate(payload);
    });

    // Countdown ticking
    useEffect(() => {
        if (!isRunning) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev > 0) {
                    return prev - 1;
                }
                return 0;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [isRunning]);
    //Reset the beat
    useEffect(() => {
        if (!beat) return;
        const t = setTimeout(() => setBeat(false), 300);
        return () => clearTimeout(t);
    }, [beat]);


    // Play Sound on state change
    useEffect(() => {
        const prev = prevStateRef.current;
        const curr = sessionState;

        if (!prev) {
            prevStateRef.current = curr;
            return;
        }

        const prevPhase =
            prev.startsWith("FOCUS") ? "FOCUS" :
                prev.startsWith("BREAK") ? "BREAK" :
                    null;

        const currPhase =
            curr.startsWith("FOCUS") ? "FOCUS" :
                curr.startsWith("BREAK") ? "BREAK" :
                    null;

        // Phase changed
        if (prevPhase && currPhase && prevPhase !== currPhase) {
            if (prevPhase === "FOCUS" && currPhase === "BREAK") {
                playFocusComplete();
            }

            if (prevPhase === "BREAK" && currPhase === "FOCUS") {
                playBreakComplete();
            }
        }

        // Final termination
        if (curr === FSM.TERMINATED && prev !== FSM.TERMINATED) {
            playFocusComplete();
        }

        prevStateRef.current = curr;
    }, [sessionState]);

    // when task TERMINATED is received
    useEffect(() => {
        if (sessionState === FSM.TERMINATED && task?.id) {
            onSessionEnded?.(task.id);
        }
    }, [sessionState]);

    // Actions
    const handlePrimaryAction = async () => {
        if (!task || pending) return;
        unlock();

        setPending(true);
        try {
            switch (sessionState) {
                case FSM.IDLE:
                    await startTask(task.id);
                    break;

                case FSM.FOCUS_RUNNING:
                case FSM.BREAK_RUNNING:
                    await pauseTask(task.id);
                    break;

                case FSM.FOCUS_PAUSED:
                case FSM.BREAK_PAUSED:
                    await resumeTask(task.id);
                    break;

                default:
                    break;
            }
        } finally {
            setPending(false);
        }
    };

    const handleEndTask = async () => {
        if (!task || pending || isIdle) return;

        try {
            setPending(true);
            await completeTask(task.id);
        } finally {
            setPending(false);
        }
    };

    // Helpers
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const CIRCUMFERENCE = 2 * Math.PI * 45;

    const progress = useMemo(
        () => (totalDuration ? (timeLeft / totalDuration) * CIRCUMFERENCE : 0),
        [timeLeft, totalDuration]
    );

    // gradient colors for Focus and Break
    const mode =
        sessionState.startsWith("FOCUS")
            ? "FOCUS"
            : sessionState.startsWith("BREAK")
                ? "BREAK"
                : "IDLE";

    const [startColor, endColor] = gradientByState[mode];

    if (!task) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex items-center justify-center h-full">
                <p className="text-gray-400">Select a task to start focusing</p>
            </div>
        );
    }


    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border transition-all ${isRunning && sessionState.startsWith("FOCUS") ? "border-blue-500/50 ring-4 ring-blue-500/5" : "" }
        ${isRunning && sessionState.startsWith("BREAK") ? "border-green-500/50 ring-4 ring-green-500/5" : ""}
        ${!isRunning ? "border-gray-200 dark:border-gray-700" : ""}`}>
            <div className="flex flex-col items-center gap-6">

                {/* Timer */}
                <div
                    className={`
                        relative w-48 h-48 flex items-center justify-center
                        transition-transform
                        ${beat ? "animate-heartbeat" : ""}
                        ${isRunning && sessionState.startsWith("FOCUS") ? "animate-focus-pulse" : ""}
                        ${isRunning && sessionState.startsWith("BREAK") ? "animate-break-pulse" : ""}
                    `}
                >

                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-100 dark:text-gray-700" />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="url(#timerGradient)"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray="283"
                            strokeDashoffset={283 - progress}
                            strokeLinecap="round"
                            className={`
                                transition-all duration-1000 linear
                                ${isRunning && sessionState.startsWith("FOCUS") ? "animate-focus-pulse" : ""}
                                ${isRunning && sessionState.startsWith("BREAK") ? "animate-break-pulse" : ""}
                            `}
                        />

                        <defs>
                            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={startColor} />
                                <stop offset="100%" stopColor={endColor} />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="text-center z-10">
                        <p className="text-5xl font-black">{formatTime(timeLeft)}</p>
                        <p
                            className={`text-xs uppercase tracking-widest mt-1 ${isBreak
                                    ? "text-green-400"
                                    : sessionState.startsWith("FOCUS")
                                        ? "text-blue-400"
                                        : "text-gray-400"
                                }`}
                        >
                            {sessionState === FSM.FOCUS_RUNNING && "Focusing"}
                            {sessionState === FSM.FOCUS_PAUSED && "Focus Paused"}
                            {sessionState === FSM.BREAK_RUNNING && "Break"}
                            {sessionState === FSM.BREAK_PAUSED && "Break Paused"}
                            {sessionState === FSM.IDLE && "Idle"}
                        </p>
                    </div>
                </div>

                {/* Task Info */}
                <div className="text-center">
                    <h3 className="text-xl font-bold line-clamp-1 cursor-pointer" title={task?.title}>{task?.title || "No Active Task"}</h3>
                    <span className="text-xs uppercase text-gray-400">{task?.category || "Idle"}</span>
                </div>

                {/* Controls */}
                <div className="flex gap-3 w-full">
                    <button onClick={handlePrimaryAction} disabled={pending || isTerminated}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition
                        ${isRunning ? "bg-amber-100 text-amber-600" : "bg-blue-600 text-white"}`}>

                        {sessionState === FSM.IDLE && <><IoPlayOutline /> Start</>}
                        {sessionState === FSM.FOCUS_RUNNING && <><IoPauseCircle /> Pause</>}
                        {sessionState === FSM.FOCUS_PAUSED && <><IoPlayOutline /> Resume</>}
                        {sessionState === FSM.BREAK_RUNNING && <><IoPauseCircle /> Pause</>}
                        {sessionState === FSM.BREAK_PAUSED && <><IoPlayOutline /> Resume</>}
                    </button>

                    {showEndButton && (
                        <button onClick={handleEndTask} disabled={pending || isTerminated}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-red-600">
                            <IoStopCircle /> End
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CurrentTaskTimer;
