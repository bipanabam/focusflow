import React from "react";
import { useNavigate } from "react-router-dom";

import { CiEdit } from "react-icons/ci";

const TaskCard = ({ task }) => {
    const categoryColors = {
        Work: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
        Team: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
        Personal: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
        Admin: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
    };

    const statusColors = {
        "completed": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
        "in_progress": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
        "pending" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    };

    const priorityColors = {
        high: "text-red-600 dark:text-red-400",
        medium: "text-yellow-600 dark:text-yellow-400",
        low: "text-green-600 dark:text-green-400"
    };
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
            
            <div className="flex items-start justify-between mb-3">
                {/* <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColors[task.category] || categoryColors.Work}`}>
                    {task.category}
                </span> */}
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority.toUpperCase()}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[task.status]}`}>
                    {task.status === "completed" ? "Completed" : task.status === "in_progress" ? "Active" : "Pending"}
                </span>
            </div>

            <h4 className="text-sm font-semibold text-gray-900 dark:text-white px-2 mb-3 line-clamp-2">
                {task.title}
            </h4>

            <div className="flex items-center justify-between">
                {/* {task.estimated_pomodoros ?
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.floor(task.duration / 60)}m estimated
                    </span> :
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        No ET
                    </span> 
                } */}
                {/* Add Task */}
                <button
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition'
                    title='Edit task'
                >
                    <CiEdit size='22px' />
                </button>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
                    Start →
                </button>
            </div>
        </div>
    );
};

export default TaskCard;
