import MonthlyHeatmap from "./MonthlyHeatmap";

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
    });
};

const StreaksAndBadges = ({ streaks }) => {
    const current = streaks?.current_streak || 0;
    const longest = streaks?.longest_streak || 0;

    const badges = [
        current >= 3 && { icon: "🔥", label: "3-Day Streak", desc: `${current} days in a row` },
        current >= 7 && { icon: "🚀", label: "7-Day Warrior", desc: "Consistency unlocked" },
        longest >= 14 && { icon: "🏆", label: "Marathon Focus", desc: `Best: ${longest} days` }
    ].filter(Boolean);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Streaks & Badges</h3>

            {current === 0 && (
                <div className="text-center text-sm text-gray-500 py-6">
                    🔥 Complete a task today to start your streak
                </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
                <div className="space-y-3">
                    {badges.map((b, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-2xl">{b.icon}</span>
                            <div>
                                <p className="text-sm font-semibold">{b.label}</p>
                                <p className="text-xs text-gray-500">{b.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {current > 0 && (
                <>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Next milestone</span>
                            <span>{streaks.current_streak}/7</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div
                                className="h-2 bg-[#3B82F6] rounded-full transition-all"
                                style={{
                                    width: `${Math.min((streaks.current_streak / 7) * 100, 100)}%`
                                }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Started on {formatDate(streaks.streak_start_date)}
                        </p>
                    </div>
                </>
            )}
            <div className="mt-6">
                <p className="text-xs text-gray-500 mb-2">
                    Last 30 days activity
                </p>
                <MonthlyHeatmap
                    streakStart={streaks?.streak_start_date}
                />
            </div>
            {/* Call to Action */}
            {/* <button className="w-full mt-auto py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                Unlock Team View
                <br />
                <span className="text-xs">Upgrade to Pro</span>
            </button> */}
        </div>
    );
};

export default StreaksAndBadges;
