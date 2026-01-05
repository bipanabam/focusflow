import {
    CiCircleCheck,
    CiTimer,
    CiPause1
} from "react-icons/ci";

export const TASK_STATUS = {
    completed: {
        label: "Completed",
        icon: CiCircleCheck,
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-700 dark:text-green-200",
    },
    in_progress: {
        label: "In Progress",
        icon: CiTimer,
        bg: "bg-blue-100 dark:bg-blue-900/20",
        text: "text-blue-700 dark:text-blue-200",
    },
    pending: {
        label: "Pending",
        icon: CiPause1,
        bg: "bg-gray-100 dark:bg-gray-700",
        text: "text-gray-700 dark:text-gray-200",
    },
};

export const TASK_PRIORITY = {
    high: "text-red-600 dark:text-red-400",
    medium: "text-yellow-600 dark:text-yellow-400",
    low: "text-green-600 dark:text-green-400",
};

export const TASK_CATEGORY = {
    work: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    team: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
    personal: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    admin: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
};

export const gradientByState = {
    FOCUS: ["#3b82f6", "#8b5cf6"],     // blue → violet
    BREAK: ["#22c55e", "#16a34a"],     // green tones
    IDLE: ["#9ca3af", "#6b7280"],      // gray
};
