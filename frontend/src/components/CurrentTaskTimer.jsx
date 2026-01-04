import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePomodoroSocket } from "../hooks/usePomodoroSocket";
import { IoPlayOutline, IoPauseCircle, IoStopCircle } from "react-icons/io5";
import { startTask, resumeTask, pauseTask, completeTask, getActiveSession } from "../api/apiEndpoints";

import { FSM, RUNNING_STATES, PAUSED_STATES } from "../constants/fsm";


const DEFAULT_DURATION = 25 * 60; // 25 mins

const computeRemainingSeconds = ({ started_at, total_duration_seconds, paused_seconds = 0 }) => {
    const startedAt = new Date(started_at).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startedAt) / 1000);
    return Math.max(total_duration_seconds - elapsed - paused_seconds, 0);
};

const CurrentTaskTimer = ({ task, session }) => {
    console.log(task)
    console.log(session)
    // Determine initial time
    const initialTime = session
        ? session.total_duration_seconds - session.paused_seconds
        : task?.estimated_pomodoros * 25 * 60;

    const [sessionState, setSessionState] = useState(FSM.IDLE);
    const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
    const [totalDuration, setTotalDuration] = useState(DEFAULT_DURATION);
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


    const trackEvent = (name, payload = {}) => {
        console.log(`[EVENT] ${name}`, payload);
    };

    // Reset when task changes
    useEffect(() => {
        if (!task?.id) return;

        setSessionState(FSM.IDLE);
        const initialTime = task?.estimated_pomodoros
            ? task.estimated_pomodoros * 25 * 60
            : DEFAULT_DURATION;
        setTimeLeft(initialTime);
        setTotalDuration(initialTime);
    }, [task?.id]);

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

    // Fetch active session on mount / task change
    // useEffect(() => {
    //     if (!task?.id) return;

    //     (async () => {
    //         const data = await getActiveSession(task.id);
    //         if (!data.active) return;

    //         const remaining = computeRemainingSeconds(data);
    //         setTimeLeft(remaining);
    //         setTotalDuration(data.total_duration_seconds);
    //         setSessionState(data.is_running ? SESSION_STATES.RUNNING : SESSION_STATES.PAUSED);
    //     })();
    // }, [task?.id]);
    // useEffect(() => {
    //     if (!session) return;

    //     const remaining = computeRemainingSeconds(session);

    //     setTimeLeft(remaining);
    //     setTotalDuration(session.total_duration_seconds);
    //     setSessionState(session.is_running ? SESSION_STATES.RUNNING : SESSION_STATES.PAUSED);
    // }, [session]);

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

        // if (data.ended) {
        //     setSessionState(SESSION_STATES.COMPLETED);
        //     setTimeLeft(0);
        //     return;
        // }
        // if (data.type === "FSM_TRANSITION") {
        //     setSession(data.session);
        //     setSessionState(data.state);
        // }

        // const remaining = computeRemainingSeconds(data);
        // setTimeLeft(remaining);
        // setTotalDuration(data.total_duration_seconds);
        // setSessionState(data.is_running ? SESSION_STATES.RUNNING : SESSION_STATES.PAUSED);
    });

    // Countdown ticking
    useEffect(() => {
        if (!isRunning) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    // Actions
    // const handlePrimaryAction = async () => {
    //     if (!task || pending) return;

    //     try {
    //         setPending(true);

    //         if (isIdle) await startTask(task.id);
    //         else if (isRunning) await pauseTask(task.id);
    //         else if (isPaused) await resumeTask(task.id);
    //     } finally {
    //         setPending(false);
    //     }
    // };
    const handlePrimaryAction = async () => {
        if (!task || pending) return;

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

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border transition-all ${isRunning ? "border-blue-500/50 ring-4 ring-blue-500/5" : "border-gray-200 dark:border-gray-700"}`}>
            <div className="flex flex-col items-center gap-6">

                {/* Timer */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-100 dark:text-gray-700" />
                        <circle cx="50" cy="50" r="45" stroke="url(#timerGradient)" strokeWidth="6" fill="none"
                            strokeDasharray="283" strokeDashoffset={283 - progress} strokeLinecap="round"
                            className="transition-all duration-1000 linear" />
                        <defs>
                            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="text-center z-10">
                        <p className="text-5xl font-black">{formatTime(timeLeft)}</p>
                        <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">
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
                    <h3 className="text-xl font-bold truncate">{task?.title || "No Active Task"}</h3>
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
