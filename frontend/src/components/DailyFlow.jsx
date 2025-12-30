import React from "react";

const DailyFlow = () => {
    // Mock data for the chart
    const data = [
        { time: "9 AM", value: 45 },
        { time: "10 AM", value: 52 },
        { time: "11 AM", value: 48 },
        { time: "12 PM", value: 61 },
        { time: "1 PM", value: 55 },
        { time: "2 PM", value: 67 },
        { time: "3 PM", value: 60 },
    ];

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Daily Flow</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your productivity throughout the day</p>
            </div>

            {/* Chart */}
            <div className="flex items-end justify-between h-48 gap-2">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 flex-1">
                        {/* Bar */}
                        <div className="w-full bg-gradient-to-t from-blue-400 to-blue-500 rounded-t-lg transition-all hover:from-blue-500 hover:to-blue-600 cursor-pointer"
                            style={{ height: `${(item.value / maxValue) * 150}px` }}
                        />
                        {/* Label */}
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.time}</span>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t dark:border-gray-700">
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Peak Time</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">2 PM</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Productivity</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">56%</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Sessions</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">7</p>
                </div>
            </div>
        </div>
    );
};

export default DailyFlow;
