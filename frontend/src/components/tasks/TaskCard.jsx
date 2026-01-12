import React from "react";
import { useNavigate } from "react-router-dom";
import { TbEyeEdit } from "react-icons/tb";

import { TASK_CATEGORY, TASK_PRIORITY } from "../../constants/taskUI";

const TaskCard = ({ task }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
 
            <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TASK_CATEGORY[task.category] || TASK_CATEGORY.work}`}>
                    {task.category}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TASK_PRIORITY[task.priority]}`}>
                    {task.priority.toUpperCase()}
                </span>
                {/* <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TASK_STATUS[task.status]}`}>
                    {task.status === "completed" ? "Completed" : task.status === "in_progress" ? "Active" : "Pending"}
                </span> */}
            </div>

            <h4 className={`text-sm font-semibold mb-3 line-clamp-2
                ${task.status === "completed" ? "line-through text-gray-400" : ""}
            `}>
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
                    title='View task'
                >
                    <TbEyeEdit size='20px' />
                </button>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition">
                    Start →
                </button>
            </div>
        </div>
    );
};

export default TaskCard;
