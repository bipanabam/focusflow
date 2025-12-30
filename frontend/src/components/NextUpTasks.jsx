import React from "react";

const NextUpTasks = ({ tasks }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 h-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Next Up</h3>
            
            <div className="space-y-4">
                {tasks.map((task, index) => (
                    <div key={task.id} className="pb-4 border-b dark:border-gray-700 last:border-b-0">
                        <div className="flex items-start gap-3 mb-2">
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 min-w-6">
                                {index + 1}.
                            </span>
                            <div className="flex-1 gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {task.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {task.category}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-9">
                                {task.estimated_pomodoros ? 
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                                        {Math.floor(task.estimated_pomodoros / 60)}m
                                    </span> :
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded">
                                        No ET
                                    </span> 
                                }
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-6 py-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 text-sm transition">
                View All Tasks →
            </button>
        </div>
    );
};

export default NextUpTasks;
