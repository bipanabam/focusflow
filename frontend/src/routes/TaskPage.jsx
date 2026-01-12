import React, { useState, useEffect } from 'react';
import { CiViewList, CiHashtag } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

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

                    {paginatedTasks && paginatedTasks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {paginatedTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-all">
                            {/* Decorative Icon */}
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                                <CiViewList size={32} />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                No tasks assigned today
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs mt-1 mb-6">
                                Your schedule looks clear! Why not get a head start on something new?
                            </p>

                            <button
                                onClick={() => navigate("/tasks/create")} // Adjust route as needed
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                            >
                                <CiHashtag size={20} className="stroke-2" />
                                Create Your First Task
                            </button>
                        </div>
                    )}
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