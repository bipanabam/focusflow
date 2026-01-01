import React, { useState, useEffect } from "react";
import { FiRotateCcw } from "react-icons/fi";
import { IoPlayOutline, IoPauseCircle, IoSquare } from "react-icons/io5";

const CurrentTaskTimer = ({ task }) => {
    // Default to 25 mins (1500s) if no task/time provided
    const initialTime = task?.estimated_pomodoros ? task.estimated_pomodoros * 60 : 1500;
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);

    // Sync state if task changes
    useEffect(() => {
        setTimeLeft(task?.estimated_pomodoros ? task.estimated_pomodoros * 60 : 1500);
        setIsRunning(false);
    }, [task]);

    useEffect(() => {
        let interval;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Correcting progress logic: 283 is the circumference
    const progress = (timeLeft / initialTime) * 283;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border transition-all duration-500 ${isRunning
                ? "border-blue-500/50 shadow-blue-500/10 ring-4 ring-blue-500/5"
                : "border-gray-200 dark:border-gray-700"
            }`}>
            <div className="flex flex-col items-center justify-center gap-6 h-full">
                {/* Timer Display */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 shadow-2xl rounded-full" viewBox="0 0 100 100">
                        {/* Background Track (The "Ghost" circle) */}
                        <circle
                            cx="50" cy="50" r="45"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-100 dark:text-gray-700"
                        />
                        {/* Active Progress */}
                        <circle
                            cx="50" cy="50" r="45"
                            stroke="url(#timerGradient)"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray="283"
                            strokeDashoffset={283 - progress}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                        />
                        <defs>
                            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="text-center z-10">
                        <p className={`text-5xl font-black tracking-tighter transition-colors ${isRunning ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                            }`}>
                            {formatTime(timeLeft)}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-1">
                            {isRunning ? "Focusing" : "Paused"}
                        </p>
                    </div>
                </div>

                {/* Task Info Section */}
                <div className="w-full text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate px-2">
                        {task?.title || "No Active Task"}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {task?.category || "Idle"}
                    </span>
                </div>

                {/* Controls - Improved Hierarchy */}
                <div className="w-full flex items-center gap-3">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`flex-2 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all transform active:scale-95 ${isRunning
                                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                            }`}
                    >
                        {isRunning ? <><IoPauseCircle size={20} fill="currentColor" /> Pause</> : <><IoPlayOutline size={20} fill="currentColor" /> Start</>}
                    </button>

                    {/* <button
                        onClick={() => { setIsRunning(false); setTimeLeft(initialTime); }}
                        className="flex-1 flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        title="Reset"
                    >
                        <FiRotateCcw size={20} />
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default CurrentTaskTimer;