import React from "react";

const WeeklyOverview = () => {
    const weekData = [
        { day: "Mon", completed: 5, target: 6 },
        { day: "Tue", completed: 6, target: 6 },
        { day: "Wed", completed: 4, target: 6 },
        { day: "Thu", completed: 7, target: 6 },
        { day: "Fri", completed: 6, target: 6 },
        { day: "Sat", completed: 3, target: 4 },
        { day: "Sun", completed: 2, target: 3 }
    ];

    const maxCompleted = Math.max(...weekData.map(d => d.completed));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Weekly Overview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tasks completed vs target</p>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end justify-between h-40 gap-2 mb-6">
                {weekData.map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 flex-1">
                        {/* Bars */}
                        <div className="w-full flex gap-1 items-end h-28">
                            {/* Target bar */}
                            <div
                                className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t opacity-50"
                                style={{ height: `${(day.target / maxCompleted) * 100}%` }}
                            />
                            {/* Completed bar */}
                            <div
                                className="flex-1 bg-gradient-to-t from-green-400 to-green-500 rounded-t"
                                style={{ height: `${(day.completed / maxCompleted) * 100}%` }}
                            />
                        </div>
                        {/* Label */}
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{day.day}</span>
                    </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t dark:border-gray-700">
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">33</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">33</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Success Rate</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</p>
                </div>
            </div>
        </div>
    );
};

export default WeeklyOverview;
