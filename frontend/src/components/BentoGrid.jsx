import React, { useState, useEffect } from 'react';
import CurrentTaskTimer from "./CurrentTaskTimer";
import NextUpTasks from "./NextUpTasks";
import DailyFlow from "./DailyFlow";
import StreaksAndBadges from "./StreaksAndBadges";
import TaskCard from "./TaskCard";
import PreviousTasks from "./PreviousTasks";
import StatsHeader from "./StatsHeader";
import FocusMode from "./FocusMode";
import WeeklyOverview from "./WeeklyOverview";
import QuickActions from "./QuickActions";

const BentoGrid = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const mockTasks = [
            {
                id: 1,
                title: "Writing Q2 Project Plan",
                category: "Work",
                duration: 1500,
                timeRemaining: 1499,
                status: "in-progress"
            },
            {
                id: 2,
                title: "Review PRs",
                category: "Team",
                duration: 900,
                status: "pending"
            },
            {
                id: 3,
                title: "Finish Book Chapter",
                category: "Personal",
                duration: 1800,
                status: "pending"
            },
            {
                id: 4,
                title: "Update Calendar",
                category: "Admin",
                duration: 600,
                status: "pending"
            }
        ];
        
        setTasks(mockTasks);
        setLoading(false);
    }, []);

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
                            <CurrentTaskTimer task={tasks[0]} />
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Next Up & Streaks */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <NextUpTasks tasks={tasks.slice(1, 3)} />
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
                <section className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Actions & Tasks</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <QuickActions />
                        <div className="lg:col-span-3">
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Today's Tasks</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {tasks.map((task) => (
                                        <TaskCard key={task.id} task={task} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Task History */}
                {/* <section className="mb-12">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Work History</h2>
                    <PreviousTasks tasks={tasks} />
                </section> */}
            </div>
        </div>
    );
};

export default BentoGrid;