import React from "react";

const TaskCard = ({ task }) => {
    const categoryColors = {
        Work: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
        Team: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
        Personal: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
        Admin: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
    };

    const statusColors = {
        "in-progress": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
        pending: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColors[task.category] || categoryColors.Work}`}>
                    {task.category}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[task.status]}`}>
                    {task.status === "in-progress" ? "Active" : "Pending"}
                </span>
            </div>

            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                {task.title}
            </h4>

            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.floor(task.duration / 60)}m estimated
                </span>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
                    Start →
                </button>
            </div>
        </div>
    );
};

export default TaskCard;
