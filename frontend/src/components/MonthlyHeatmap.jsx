import {useEffect, useState} from "react";

import { getMonthlyActivity } from "../api/apiEndpoints";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const MonthlyHeatmap = ({ streakStart }) => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
    const [activeDays, setActiveDays] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch monthly active days
    const fetchMonth = async (y, m) => {
        setLoading(true);
        try {
            const data = await getMonthlyActivity(y, m);
            setActiveDays(data.active_days || []);
        } catch (err) {
            console.error("Failed to fetch monthly activity", err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchMonth(year, month);
    }, [year, month]);

    // Handle prev/next month
    const handlePrev = () => {
        let newMonth = month - 1;
        let newYear = year;
        if (newMonth < 1) {
            newMonth = 12;
            newYear = year - 1;
        }
        setMonth(newMonth);
        setYear(newYear);
    };

    const handleNext = () => {
        let newMonth = month + 1;
        let newYear = year;
        if (newMonth > 12) {
            newMonth = 1;
            newYear = year + 1;
        }
        setMonth(newMonth);
        setYear(newYear);
    };

    // Build calendar cells
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startOffset = firstDay.getDay(); // 0 = Sunday
    const totalDays = lastDay.getDate();
    const cells = [];

    // Week headers
    WEEK_DAYS.forEach(day => {
        cells.push({ type: "header", label: day });
    });

    // Empty leading days
    for (let i = 0; i < startOffset; i++) {
        cells.push({ type: "empty" });
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
        cells.push({
            type: "day",
            date: new Date(year, month - 1, day)
        });
    }

    const keyFor = (date) => getLocalDateKey(date);
    const activeSet = new Set(activeDays);
    const streakKey = streakStart ? streakStart : null;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
            {/* Month navigation */}
            <div className="flex justify-between items-center mb-2">
                <button
                    onClick={handlePrev}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                    ← Prev
                </button>
                <div className="font-semibold text-gray-900 dark:text-white">
                    {new Date(year, month - 1).toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                    })}
                </div>
                <button
                    onClick={handleNext}
                    className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                    Next →
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-gray-500 text-center py-6">Loading…</p>
            ) : (
                <>
                    {/* Weekday header + calendar grid */}
                        <div
                            className="grid grid-cols-7 gap-1"
                            style={{ gridAutoRows: "24px" }}
                        >
                            {cells.map((cell, index) => {
                                if (cell.type === "header") {
                                    return (
                                        <div
                                            key={index}
                                            className="w-6 h-6 flex items-center justify-center text-[10px] font-medium text-gray-500"
                                        >
                                            {cell.label}
                                        </div>
                                    );
                                }

                                if (cell.type === "empty") {
                                    return <div key={index} className="w-6 h-6" />;
                                }

                                const key = getLocalDateKey(cell.date);
                                const isActive = activeSet.has(key);
                                const isStreakStart = key === streakKey;
                                const isToday =
                                    getLocalDateKey(today) === key;

                                return (
                                    <div
                                        key={index}
                                        title={key}
                                        className={`
                                    w-6 h-6 flex items-center justify-center text-[10px] rounded
                                    ${isActive ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}
                                    ${isStreakStart ? "ring-2 ring-orange-500" : ""}
                                    ${isToday ? "ring-2 ring-green-400" : ""}`}
                                    >
                                        {cell.date.getDate()}
                                    </div>
                                );
                            })}
                        </div>
                </>
            )}
        </div>
    );
};

export default MonthlyHeatmap;