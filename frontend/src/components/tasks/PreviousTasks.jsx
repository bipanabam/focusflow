import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { getFilteredTasks } from "../../api/apiEndpoints";
import { TASK_PRIORITY, TASK_STATUS } from "../../constants/taskUI";
import Spinner from "../../components/Spinner";

const formatDuration = (seconds = 0) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const PreviousTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    // State for Filters and Pagination
    const [status, setStatus] = useState("all");
    const [priority, setPriority] = useState("all");
    const [timeRange, setTimeRange] = useState("today");
    // Pagination
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const nav = useNavigate();

    // Mock previous tasks with status and priority
    // const previousTasks = [
    //     {
    //         id: 1,
    //         title: "Design Landing Page",
    //         category: "Work",
    //         status: "completed",
    //         priority: "high",
    //         duration: 3600,
    //         completedAt: "2 hours ago"
    //     },
    //     {
    //         id: 2,
    //         title: "Code Review Session",
    //         category: "Team",
    //         status: "completed",
    //         priority: "medium",
    //         duration: 1800,
    //         completedAt: "4 hours ago"
    //     },
    //     {
    //         id: 3,
    //         title: "Meeting with Client",
    //         category: "Work",
    //         status: "in-progress",
    //         priority: "high",
    //         duration: 2700,
    //         completedAt: "ongoing"
    //     },
    //     {
    //         id: 4,
    //         title: "Update Documentation",
    //         category: "Admin",
    //         status: "completed",
    //         priority: "low",
    //         duration: 1200,
    //         completedAt: "6 hours ago"
    //     },
    //     {
    //         id: 5,
    //         title: "Fix Bug in Dashboard",
    //         category: "Work",
    //         status: "completed",
    //         priority: "high",
    //         duration: 2400,
    //         completedAt: "1 hour ago"
    //     },
    //     {
    //         id: 6,
    //         title: "Personal Reading",
    //         category: "Personal",
    //         status: "pending",
    //         priority: "low",
    //         duration: 1800,
    //         completedAt: "pending"
    //     }
    // ];

    // Helper: Calculate Date Ranges for Django Filters
    const getDateFilter = useCallback(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        if (timeRange === "today") return { created_at__gte: today };

        if (timeRange === "weekly") {
            const lastWeek = new Date(now.setDate(now.getDate() - 7)).toISOString();
            return { created_at__gte: lastWeek };
        }

        if (timeRange === "monthly") {
            const lastMonth = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
            return { created_at__gte: lastMonth };
        }

        return {}; // "all"
    }, [timeRange]);

    // Fetch Logic
    const fetchTasks = useCallback(async (pageNum, isAppending = false) => {
        try {
            setLoading(true);
            const dateParams = getDateFilter();
            const query = {
                page: pageNum,
                ...dateParams
            };

            if (status !== "all") query.status = status;
            if (priority !== "all") query.priority = priority;

            const data = await getFilteredTasks(query);
            // Append if loading more, otherwise replace
            setTasks(prev => isAppending ? [...prev, ...data.results] : data.results);
            setHasNext(!!data.next);
            setTotalCount(data.count);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
            setIsInitialLoading(false);
        }
    }, [status, priority, getDateFilter]);

    // Trigger fetch when filters or page change
    useEffect(() => {
        setPage(1);
        fetchTasks(1, false);
    }, [status, priority, timeRange]);

    // Reset to page 1 when filters change
    const handleFilterChange = (setter) => (e) => {
        setter(e.target.value);
        setPage(1);
    };
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTasks(nextPage, true);
    };

    // Group by status
    const groupedTasks = useMemo(() => {
        const groups = {
            completed: [],
            in_progress: [],
            pending: []
        };
        tasks.forEach(task => {
            if (groups[task.status]) {
                groups[task.status].push(task);
            }
        });
        return groups;
    }, [tasks]);

    if (isInitialLoading) return <div className="flex justify-center p-12"><Spinner /></div>;

    const TaskItem = ({ task }) => (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition"
            onClick={() => nav(`/tasks/${task.id}`)}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h4 className={`text-sm font-semibold mb-3 line-clamp-2
                        ${task.status === "completed" ? "line-through text-gray-400" : ""}
                    `}>
                        {task.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.completedAt}</p>
                </div>
                <span className={`flex-0 ml-2 text-xs font-bold ${TASK_PRIORITY[task.priority]}`}>
                    {task.priority.toUpperCase()}
                </span>
            </div>
            <div className="flex justify-between items-center gap-2">
                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded">
                    {task.category}
                </span>
                <span className={`text-xs ${TASK_STATUS[task.status].text}`}>
                    {task.status === "completed" && task.focus_duration_seconds
                        ? `Total: ${formatDuration(task.focus_duration_seconds)}`
                        : `${task.status === "pending" ? "Pending" : "In Progress"}`}
                </span>
            </div>
            <div>
                <span className="text-xs text-gray-500">
                    {formatDistanceToNow(task.created_at, { addSuffix: true })}
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
                    {/* Time Range Select */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="text-sm px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="today">Today</option>
                        <option value="weekly">Last 7 Days</option>
                        <option value="monthly">Last 30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    {/* Status Filter */}
                    <select
                        value={status} onChange={handleFilterChange(setStatus)}
                        className="text-sm px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="pending">Pending</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={priority} 
                        onChange={handleFilterChange(setPriority)}
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
                {["completed", "in_progress", "pending"].map((status) => (
                    groupedTasks[status].length > 0 && (
                        <div key={status}>
                            <div className={`flex items-center gap-2 mb-4 pb-3 border-b dark:border-gray-600`}>
                                <div className={`w-3 h-3 rounded-full ${
                                    status === "completed" ? "bg-green-500" :
                                    status === "in_progress" ? "bg-blue-500" :
                                    "bg-gray-400"
                                }`} />
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                                    {status.replace("_", " ")}
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
            {tasks.length === 0 && !loading && (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-500">No tasks found for this period.</p>
                </div>
            )}

            {/* Load More Button */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-500">Total: {totalCount} tasks</p>
                <p className="text-xs text-gray-500">Showing {tasks.length} of {totalCount} tasks</p>
                {hasNext && (
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-900 rounded-lg disabled:opacity-50"
                    >
                        {loading ? <Spinner size="sm" /> : "Load More"}
                    </button>
                )}
                {!hasNext && (
                    <p className="text-sm text-gray-500"></p>
                )}
            </div>
          
            {/* Pagination Controls */}
            {/* <div className="flex justify-between items-center mt-8 pt-4 border-t dark:border-gray-700">
                <p className="text-sm text-gray-500">Total: {totalCount} tasks</p>
                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={loadPrevData}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-900 rounded-lg disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <button
                        disabled={!hasNext}
                        onClick={loadNextData}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-900 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div> */}
        </div>
    );
};

export default PreviousTasks;
