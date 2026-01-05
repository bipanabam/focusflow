import React from "react";
import { FiClock } from "react-icons/fi";
import { FaChevronRight } from "react-icons/fa6";
import { IoPlayOutline } from "react-icons/io5";
import { TASK_CATEGORY, TASK_PRIORITY } from "../../constants/taskUI";

import { useNavigate } from "react-router-dom";

const NextUpTasks = ({ tasks = [], onSelectTask, currentTask }) => {
    const nav = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700 flex flex-col h-98.5">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Next Up</h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                    {tasks.length} remaining
                </span>
            </div>

            <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
                {tasks.length > 0 ? (
                    <div className="space-y-3">
                        {tasks.map((task, index) => (
                            <div
                                key={task.id}
                                onClick={() => onSelectTask?.(task)}
                                className={`group cursor-pointer relative p-3 -mx-2 rounded-xl
                                hover:bg-gray-50 dark:hover:bg-gray-700/50
                                transition-colors border border-transparent
                                hover:border-blue-200 dark:hover:border-blue-500/30
                                 ${task.id === currentTask?.id ? "bg-blue-50 dark:bg-blue-900/30" : ""}
                                `}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-400 mt-1">
                                            {(index + 1).toString().padStart(2, '0')}
                                        </span>
                                        <div className="h-10 w-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                                            <IoPlayOutline size={16} className="text-gray-400 group-hover:text-white" />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                {task.title}
                                            </p>
                                            <span className={`text-[10px] uppercase tracking-tighter font-bold px-2 py-0.5 rounded ${TASK_PRIORITY[task.priority]}`}>
                                                {task.priority}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TASK_CATEGORY[task.category] || 'bg-gray-100'}`}>
                                                {task.category}
                                            </span>
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <FiClock size={12} />
                                                <span className="text-[11px]">
                                                    {task.estimated_pomodoros ? `${Math.floor(task.estimated_pomodoros / 60)}m` : 'No ET'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                        <p className="text-sm text-gray-500">No upcoming tasks</p>
                    </div>
                )}
            </div>
            <div className="p-4 mt-auto border-t dark:border-gray-700">
                <button
                    onClick={() => nav('/tasks')}
                    className="w-full py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm rounded-xl transition-all"
                >
                    View All Tasks →
                </button>
            </div>
        </div>
    );
};

export default NextUpTasks;