import React from "react";

const formatDuration = (seconds = 0) => {
    const h = Math.floor(seconds / 3600 )
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}h ${m}m ${s}s` : (m > 0 ? `${m}m ${s}s` : `${s}s`);
};

const StatsHeader = ({dailySummary}) => {
    const stats = [
        {
            label: "Tasks Today",
            value: dailySummary?.total_tasks ?? 0,
            subtext: `${dailySummary?.completed_tasks} completed`,
            icon: "✓",
            color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
        },
        {
            label: "Time Focused",
            value: formatDuration(dailySummary?.total_focus_seconds),
            subtext: "+25% from yesterday",
            icon: "⏱",
            color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
        },
        {
            label: "Productivity",
            value: `${dailySummary?.avg_daily_productivity}%`,
            subtext: "Your best today",
            icon: "📈",
            color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300"
        },
        {
            label: "Streak",
            value: "7 days",
            subtext: "Keep it going!",
            icon: "🔥",
            color: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                        </div>
                        <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${stat.color}`}>
                            {stat.icon}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.subtext}</p>
                </div>
            ))}
        </div>
    );
};

export default StatsHeader;
