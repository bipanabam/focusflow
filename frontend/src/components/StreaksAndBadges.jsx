import React from "react";

const StreaksAndBadges = () => {
    const badges = [
        { icon: "🔥", label: "5 Day Fire", count: "15 Tasks Done", color: "text-orange-500" },
        { icon: "✓", label: "5 Day Fire", count: "15 Tasks Done", color: "text-green-500" },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Streaks & Badges</h3>

            {/* Badges */}
            <div className="space-y-3 mb-6">
                {badges.map((badge, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-2xl">{badge.icon}</span>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{badge.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{badge.count}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Call to Action */}
            <button className="w-full mt-auto py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                Unlock Team View
                <br />
                <span className="text-xs">Upgrade to Pro</span>
            </button>
        </div>
    );
};

export default StreaksAndBadges;
