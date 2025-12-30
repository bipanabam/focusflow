import React from "react";

const QuickActions = () => {
    const actions = [
        {
            icon: "➕",
            label: "New Task",
            color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
            action: "create"
        },
        {
            icon: "🎯",
            label: "Set Goal",
            color: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300",
            action: "goal"
        },
        {
            icon: "📅",
            label: "Schedule",
            color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300",
            action: "schedule"
        },
        {
            icon: "⚙️",
            label: "Settings",
            color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
            action: "settings"
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => (
                    <button
                        key={action.action}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-current transition ${action.color}`}
                    >
                        <span className="text-2xl">{action.icon}</span>
                        <span className="text-xs font-semibold">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
