import React, { useState, useEffect } from "react";

const CurrentTaskTimer = ({ task }) => {
    const [timeLeft, setTimeLeft] = useState(task?.timeRemaining || 1500);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = ((task?.duration - timeLeft) / task?.duration) * 100;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center justify-center gap-6 h-full">
                {/* Timer Circle */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="#3b82f6"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(progressPercentage / 100) * 283} 283`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="text-center">
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                </div>

                {/* Task Info */}
                <div className="w-full text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {task?.title}
                    </h3>
                    <div className="flex gap-2 justify-center mb-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs rounded-full font-medium">
                            {task?.category}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="w-full flex gap-3">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                            isRunning
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {isRunning ? 'Pause' : 'Start'}
                    </button>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        End
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CurrentTaskTimer;
