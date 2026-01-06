import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const DailyFlow = ({ flow = [], total_pomodoros }) => {
    if (!flow.length) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                <p className="text-sm text-gray-500">No activity today</p>
            </div>
        );
    }

    const peak = flow.reduce((a, b) => (b.value > a.value ? b : a));
    const avg = Math.round(
        flow.reduce((sum, i) => sum + i.value, 0) / flow.length
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Daily Flow
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Productivity throughout the day
                </p>
            </div>

            {/* Chart */}
            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={flow}>
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 12 }}
                            stroke="currentColor"
                        />
                        <YAxis hide />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                backgroundColor: "#111827",
                                borderRadius: 8,
                                border: "none",
                                color: "#fff",
                            }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                            fill="currentColor"
                            className="text-blue-500"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t dark:border-gray-700">
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Peak Time
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {peak.time}
                    </p>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Avg Productivity
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {avg}%
                    </p>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total Sessions
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {total_pomodoros}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DailyFlow;
