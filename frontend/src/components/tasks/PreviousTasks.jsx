import React, { useState, useMemo } from "react";

const PreviousTasks = ({ tasks = [] }) => {
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedPriority, setSelectedPriority] = useState("all");

    // Mock previous tasks with status and priority
    const previousTasks = [
        {
            id: 1,
            title: "Design Landing Page",
            category: "Work",
            status: "completed",
            priority: "high",
            duration: 3600,
            completedAt: "2 hours ago"
        },
        {
            id: 2,
            title: "Code Review Session",
            category: "Team",
            status: "completed",
            priority: "medium",
            duration: 1800,
            completedAt: "4 hours ago"
        },
        {
            id: 3,
            title: "Meeting with Client",
            category: "Work",
            status: "in-progress",
            priority: "high",
            duration: 2700,
            completedAt: "ongoing"
        },
        {
            id: 4,
            title: "Update Documentation",
            category: "Admin",
            status: "completed",
            priority: "low",
            duration: 1200,
            completedAt: "6 hours ago"
        },
        {
            id: 5,
            title: "Fix Bug in Dashboard",
            category: "Work",
            status: "completed",
            priority: "high",
            duration: 2400,
            completedAt: "1 hour ago"
        },
        {
            id: 6,
            title: "Personal Reading",
            category: "Personal",
            status: "pending",
            priority: "low",
            duration: 1800,
            completedAt: "pending"
        }
    ];

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return previousTasks.filter(task => {
            const statusMatch = selectedStatus === "all" || task.status === selectedStatus;
            const priorityMatch = selectedPriority === "all" || task.priority === selectedPriority;
            return statusMatch && priorityMatch;
        });
    }, [selectedStatus, selectedPriority]);

    // Group by status
    const groupedTasks = useMemo(() => {
        const groups = {
            completed: [],
            "in-progress": [],
            pending: []
        };
        filteredTasks.forEach(task => {
            if (groups[task.status]) {
                groups[task.status].push(task);
            }
        });
        return groups;
    }, [filteredTasks]);

    const statusColors = {
        completed: { bg: "bg-green-100", text: "text-green-700", darkBg: "dark:bg-green-900", darkText: "dark:text-green-200" },
        "in-progress": { bg: "bg-blue-100", text: "text-blue-700", darkBg: "dark:bg-blue-900", darkText: "dark:text-blue-200" },
        pending: { bg: "bg-gray-100", text: "text-gray-700", darkBg: "dark:bg-gray-700", darkText: "dark:text-gray-200" }
    };

    const priorityColors = {
        high: "text-red-600 dark:text-red-400",
        medium: "text-yellow-600 dark:text-yellow-400",
        low: "text-green-600 dark:text-green-400"
    };

    const TaskItem = ({ task }) => (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {task.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.completedAt}</p>
                </div>
                <span className={`flex-shrink-0 ml-2 text-xs font-bold ${priorityColors[task.priority]}`}>
                    {task.priority.toUpperCase()}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                    {task.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.floor(task.duration / 60)}m
                </span>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            {/* Header with Filters */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Previous Tasks</h3>
                
                {/* Filter Controls */}
                <div className="flex gap-3">
                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="text-sm px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="pending">Pending</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="text-sm px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Tasks by Status */}
            <div className="space-y-8">
                {["completed", "in-progress", "pending"].map((status) => (
                    groupedTasks[status].length > 0 && (
                        <div key={status}>
                            <div className={`flex items-center gap-2 mb-4 pb-3 border-b dark:border-gray-600`}>
                                <div className={`w-3 h-3 rounded-full ${
                                    status === "completed" ? "bg-green-500" :
                                    status === "in-progress" ? "bg-blue-500" :
                                    "bg-gray-400"
                                }`} />
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                                    {status.replace("-", " ")}
                                </h4>
                                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {groupedTasks[status].length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {groupedTasks[status].map((task) => (
                                    <TaskItem key={task.id} task={task} />
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* Empty State */}
            {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No tasks found with selected filters</p>
                </div>
            )}
        </div>
    );
};

export default PreviousTasks;
