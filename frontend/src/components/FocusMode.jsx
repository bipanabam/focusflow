import React, { useState } from "react";

const FocusMode = () => {
    const [isFocused, setIsFocused] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(25);

    const durations = [
        { label: "Quick", value: 15 },
        { label: "Standard", value: 25 },
        { label: "Deep Work", value: 45 },
        { label: "Custom", value: 60 }
    ];

    return (
        <div className={`rounded-2xl p-6 shadow-md border transition-all ${
            isFocused
                ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-400 dark:border-blue-500'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isFocused ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    Focus Mode
                </h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isFocused
                        ? 'bg-white text-blue-600'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                }`}>
                    {isFocused ? 'ACTIVE' : 'OFF'}
                </span>
            </div>

            {!isFocused ? (
                <div>
                    <p className={`text-sm mb-4 ${isFocused ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                        Block distractions and focus on your current task
                    </p>

                    {/* Duration Selection */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {durations.map((duration) => (
                            <button
                                key={duration.value}
                                onClick={() => setSelectedDuration(duration.value)}
                                className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${
                                    selectedDuration === duration.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {duration.label}
                                <br />
                                {duration.value}m
                            </button>
                        ))}
                    </div>

                    {/* Start Button */}
                    <button
                        onClick={() => setIsFocused(true)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                    >
                        Start Focus Session ({selectedDuration}m)
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-white text-sm mb-4">Focus session active - No distractions!</p>
                    <div className="text-white text-4xl font-bold mb-4">25:00</div>
                    <button
                        onClick={() => setIsFocused(false)}
                        className="w-full py-2 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg transition"
                    >
                        End Session
                    </button>
                </div>
            )}
        </div>
    );
};

export default FocusMode;
