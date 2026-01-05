import React, { useState, useEffect } from 'react';
import CurrentTaskTimer from "./CurrentTaskTimer";
import NextUpTasks from "./tasks/NextUpTasks";
import DailyFlow from "./DailyFlow";
import StreaksAndBadges from "./StreaksAndBadges";
import TaskCard from "./tasks/TaskCard";
import PreviousTasks from "./tasks/PreviousTasks";
import StatsHeader from "./StatsHeader";
import FocusMode from "./FocusMode";
import WeeklyOverview from "./WeeklyOverview";
import QuickActions from "./QuickActions";
import Spinner from "./Spinner";

import { getTodaysUncompletedTask, getActiveSession, getTask } from "../api/apiEndpoints";

const ACTIVE_STATES = [
    "FOCUS_RUNNING",
    "FOCUS_PAUSED",
    "BREAK_RUNNING",
    "BREAK_PAUSED"
];

const BentoGrid = () => {
    const [todaysTasks, setTodaysTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const todayStr = new Date().toISOString().split("T")[0];

                const tasksData = await getTodaysUncompletedTask(1, todayStr);
                const tasks = tasksData.results || tasksData;

                const session = await getActiveSession();
                let activeSessionData = null;

                if (ACTIVE_STATES.includes(session.fsm_state)) {
                    const activeTask =
                    tasks.find(t => t.id === session.task_id) ||
                    await getTask(session.task_id);
                    activeSessionData = { session, task: activeTask };
                }

                // if (session?.is_running) {
                //     const activeTask =
                //         tasks.find(t => t.id === session.task_id) ||
                //         await getTask(session.task_id);

                //     activeSessionData = { session, task: activeTask };
                // }

                setTodaysTasks(
                    activeSessionData
                        ? tasks.filter(t => t.id !== activeSessionData.task.id)
                        : tasks
                );

                setActiveSession(activeSessionData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    

    if (loading) return <Spinner fullScreen />;

    return (
        <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                {/* Section 1: Quick Stats Overview */}
                <section className="mb-12">
                    <StatsHeader />
                </section>

                {/* Section 2: Focus & Next Up */}
                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Today's Focus</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Current Task Timer */}
                        <div className="lg:col-span-1 lg:row-span-2">
                            <CurrentTaskTimer
                                session={activeSession?.session}
                                task={activeSession?.task || todaysTasks[0]}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Next Up & Streaks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <NextUpTasks tasks={todaysTasks.slice(1, )} />
                                <StreaksAndBadges />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Analytics */}
                {/* <section className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Analytics</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DailyFlow />
                        <WeeklyOverview />
                    </div>
                </section> */}

                {/* Section 4: Quick Actions & Tasks */}
                {/* <section className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Actions & Tasks</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <QuickActions />
                        <div className="lg:col-span-3">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Today's Tasks</h3>
                                    <div className="flex flex-row gap-6">
                                        {currentPage > 1 && !loading && (
                                            <button onClick={loadPreviousTasks}  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
                                                ← Previous
                                            </button>
                                        )}
                                        {nextPage && !loading && (
                                            <button onClick={loadMoreTasks}  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
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
                        </div>
                    </div>
                </section> */}

                {/* Section 5: Task History */}
                {/* <section className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Work History</h2>
                    <PreviousTasks tasks={pinnedTasks} />
                </section> */}
            </div>
        </div>
    );
};

export default BentoGrid;