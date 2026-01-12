import React, { useState, useEffect, useMemo } from 'react';
import CurrentTaskTimer from "./CurrentTaskTimer";
import NextUpTasks from "./tasks/NextUpTasks";
import DailyFlow from "./DailyFlow";
import StreaksAndBadges from "./StreaksAndBadges";
import PreviousTasks from "./tasks/PreviousTasks";
import StatsHeader from "./StatsHeader";
import FocusMode from "./FocusMode";
import WeeklyOverview from "./WeeklyOverview";
import Spinner from "./Spinner";

import { getTodaysUncompletedTask, getActiveSession, getTask, getDailySummary, getStreaks } from "../api/apiEndpoints";

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
    const [currentTask, setCurrentTask] = useState(null);
    const [dailySummary, setDailySummary] = useState(null);
    const [streaks, setStreaks] = useState(null);

    const nextUpTasks = useMemo(() => {
        if (!activeSession?.task?.id) return todaysTasks;

        return todaysTasks.filter(
            t => t.id !== activeSession.task.id
        );
    }, [todaysTasks, activeSession]);

    const handleSessionEnded = (taskId) => {
        // Remove completed task from today
        setTodaysTasks(prev => prev.filter(t => t.id !== taskId));

        // Clear active session
        setActiveSession(null);

        // Clear current task (or move to next)
        setCurrentTask(null);
    };

    const fetchDailySummary = async () => {
        try {
            const todayStr = new Date().toISOString().split("T")[0];
            const response = await getDailySummary(todayStr);
            setDailySummary(response);
        } catch (err) {
            console.error("Failed to fetch daily summary", err);
        }
    };

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
                    setCurrentTask(activeTask);
                } else {
                    setCurrentTask(tasks[0] || null);
                }
                // if (session?.is_running) {
                //     const activeTask =
                //         tasks.find(t => t.id === session.task_id) ||
                //         await getTask(session.task_id);

                //     activeSessionData = { session, task: activeTask };
                // }

                setTodaysTasks(tasks);
                setActiveSession(activeSessionData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        const fetchStreaks = async () => {
            try {
                const data = await getStreaks();
                setStreaks(data);
            } catch (err) {
                console.error("Failed to fetch streaks", err);
            }
        };

        fetchData();
        fetchDailySummary();
        fetchStreaks();
    }, []);

    if (loading) return <Spinner fullScreen />;

    return (
        <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="w-full max-w-7xl mx-auto px-4 py-8">
                {/* Section 1: Quick Stats Overview */}
                <section className="mb-12">
                    <StatsHeader 
                        dailySummary={dailySummary}
                        streaks={streaks} />
                </section>

                {/* Section 2: Focus & Next Up */}
                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Today's Focus</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Current Task Timer */}
                        <div className="lg:col-span-1 lg:row-span-2">
                            <CurrentTaskTimer
                                task={currentTask}
                                session={activeSession?.session}
                                onSessionEnded={handleSessionEnded}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Next Up & Streaks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <NextUpTasks tasks={nextUpTasks}
                                    currentTask={currentTask}
                                    onSelectTask={async (task) => {
                                        // stop old session UI immediately
                                        setActiveSession(null);
                                        setCurrentTask(task);
                                        // optional: auto-start
                                        // await startTask(task.id);
                                    }} />
                                <StreaksAndBadges streaks={streaks} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Analytics */}
                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Analytics</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DailyFlow flow={dailySummary?.daily_flow || []} 
                        total_pomodoros={dailySummary?.total_pomodoros} />
                        {/* <WeeklyOverview /> */}
                        <WeeklyOverview />
                    </div>
                </section>

                {/* Section 4: Task History */}
                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Work History</h2>
                    <PreviousTasks />
                </section>
            </div>
        </div>
    );
};

export default BentoGrid;