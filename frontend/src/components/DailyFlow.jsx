import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const DailyFlow = ({ flow = [], total_pomodoros}) => {
    // if (!flow.length) return <div>No activity today</div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Daily Flow
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Focus vs Break per hour
                </p>
            </div>

            <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={flow}>
                        <XAxis dataKey="time" stroke="currentColor" tick={{ fontSize: 12 }} />
                        <YAxis hide />
                        <Tooltip
                            formatter={(value, name, props) => [
                                value,
                                name.charAt(0).toUpperCase() + name.slice(1),
                            ]}
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                backgroundColor: "#111827",
                                borderRadius: 8,
                                border: "none",
                                color: "#fff",
                            }}
                        />
                        <Bar dataKey="break" stackId="a" fill="#D1D5DB" />
                        <Bar dataKey="focus" radius={[8, 8, 0, 0]} stackId="a" fill="#3B82F6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t dark:border-gray-700">
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Peak Productivity</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {Math.max(...flow.map(f => f.productivity))}%
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avg Productivity</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {Math.round(
                            flow.reduce((sum, f) => sum + f.productivity, 0) / flow.length
                        )}%
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
