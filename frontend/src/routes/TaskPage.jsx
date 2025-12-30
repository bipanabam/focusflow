import React, { useState, useEffect } from 'react';
import TaskCard from "../components/tasks/TaskCard";
import PreviousTasks from "../components/tasks/PreviousTasks";
import Spinner from "../components/Spinner";
import { getTodaysTask } from "../api/apiEndpoints";

const TaskPage = () => {
    const [pinnedTasks, setPinnedTasks] = useState([]);
    const [paginatedTasks, setPaginatedTasks] = useState([]);
    const [nextPage, setNextPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchPinnedTasks = async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const data = await getTodaysTask(1, todayStr);
        setPinnedTasks(data.results || data);
    };

    const fetchTodaysTaskData = async (page) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const data = await getTodaysTask(page, todayStr);
        setPaginatedTasks(data.results || data);
        setNextPage(data.next ? page + 1 : null);
    };

    useEffect(() => {
        fetchPinnedTasks();
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                await fetchTodaysTaskData(currentPage);
            } catch {
                alert('error getting posts');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [currentPage]);

    const loadMoreTasks = () => {
        if (nextPage) setCurrentPage((p) => p + 1);
    };
    const loadPreviousTasks = () => {
        if (currentPage > 1) setCurrentPage((p) => p - 1);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Today's Tasks</h3>
                        <div className="flex flex-row gap-6">
                            {currentPage > 1 && (
                                <button onClick={loadPreviousTasks} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
                                    ← Previous
                                </button>
                            )}
                            {nextPage && (
                                <button onClick={loadMoreTasks} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
                                    Load More →
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {paginatedTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </div>

                <section>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Work History</h2>
                    <PreviousTasks tasks={pinnedTasks} />
                </section>
            </div>
        </div>
    );
};

export default TaskPage;