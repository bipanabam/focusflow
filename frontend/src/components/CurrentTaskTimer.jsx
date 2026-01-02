import React, { useState, useEffect, useRef } from "react";
import { usePomodoroSocket } from "../hooks/usePomodoroSocket";
import { IoPlayOutline, IoPauseCircle, IoStopCircle } from "react-icons/io5";
import { startTask, resumeTask, pauseTask, completeTask } from "../api/apiEndpoints";

const DEFAULT_DURATION = 25 * 60; // 25 mins

const CurrentTaskTimer = ({ task }) => {
    const initialTime =
        task?.estimated_pomodoros
            ? task.estimated_pomodoros * 25 * 60
            : DEFAULT_DURATION;

    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [totalDuration, setTotalDuration] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const [hasSession, setHasSession] = useState(false);

    const timerRef = useRef(null);
    const [pending, setPending] = useState(false);

    // Reset state when task changes
    useEffect(() => {
        clearInterval(timerRef.current);
        setTimeLeft(initialTime);
        setTotalDuration(initialTime);
        setIsRunning(false);
        setHasSession(false);
    }, [task?.id]);

    // Local ticking
    useEffect(() => {
        if (!isRunning) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setIsRunning(false);
                    setHasSession(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    // WebSocket handlers
    usePomodoroSocket({
        session_state: (data) => {
            if (data.task_id !== task?.id) return;
            setHasSession(true);
            setTimeLeft(data.remaining_seconds);
            setTotalDuration(data.total_duration_seconds);
            setIsRunning(data.is_running);
        },

        task_started: (data) => {
            if (data.task_id !== task?.id) return;
            setHasSession(true);
            setTimeLeft(data.duration_seconds);
            setTotalDuration(data.duration_seconds);
            setIsRunning(true);
        },

        task_paused: (data) => {
            if (data.task_id !== task?.id) return;
            setIsRunning(false);
        },

        task_resumed: (data) => {
            if (data.task_id !== task?.id) return;
            setTimeLeft(data.remaining_seconds);
            setIsRunning(true);
        },

        session_completed: (data) => {
            if (data.task_id !== task?.id) return;
            setTimeLeft(0);
            setIsRunning(false);
            setHasSession(false);
        },
    });

    // Actions
    const handleAction = async () => {
        if (!task || pending) return;

        try {
            setPending(true);

            if (!hasSession) {
                await startTask(task.id);
                return;
            }

            if (isRunning) {
                await pauseTask(task.id);
            } else {
                await resumeTask(task.id);
            }
        } finally {
            setPending(false);
        }
    };

    const handleEndTask = async () => {
        if (!task || pending || !hasSession) return;
        try {
            setPending(true);
            await completeTask(task.id);
        } finally {
            setPending(false);
            setIsRunning(false);
            setHasSession(false);
            setTimeLeft(0);
        }
    };

    // Helpers
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const progress = totalDuration ? (timeLeft / totalDuration) * 283 : 0;

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border transition-all ${isRunning
                    ? "border-blue-500/50 ring-4 ring-blue-500/5"
                    : "border-gray-200 dark:border-gray-700"
                }`}
        >
            <div className="flex flex-col items-center gap-6">

                {/* Timer */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-100 dark:text-gray-700"
                        />
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
                            className="transition-all duration-1000 linear"
                        />
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
                            {isRunning ? "Focusing" : hasSession ? "Paused" : "Idle"}
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
                    <button
                        onClick={handleAction}
                        disabled={pending}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition ${isRunning
                                ? "bg-amber-100 text-amber-600 hover:bg-amber-400"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        {isRunning ? (
                            <>
                                <IoPauseCircle size={20} /> Pause
                            </>
                        ) : (
                            <>
                                <IoPlayOutline size={20} /> {hasSession ? "Resume" : "Start"}
                            </>
                        )}
                    </button>

                    {hasSession && (
                        <button
                            onClick={handleEndTask}
                            disabled={pending}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition"
                        >
                            <IoStopCircle size={20} /> End
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CurrentTaskTimer;
