import { useNavigate } from "react-router-dom";
import { FiUser, FiClock } from "react-icons/fi";

const SettingsIndex = () => {
    const navigate = useNavigate();

    const cards = [
        {
            title: "Account Settings",
            description: "View account details, timezone, and profile information.",
            icon: <FiUser className="w-6 h-6" />,
            path: "account",
            color: "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300"
        },
        {
            title: "Pomodoro Settings",
            description: "Customize focus duration, breaks, and productivity flow.",
            icon: <FiClock className="w-6 h-6" />,
            path: "pomodoro",
            color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Settings
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Manage your account and productivity preferences
                </p>
            </div>

            {/* Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
                {cards.map((card) => (
                    <button
                        key={card.title}
                        onClick={() => navigate(card.path)}
                        className="group text-left p-5 rounded-xl border dark:border-gray-700
                                   hover:border-indigo-500 dark:hover:border-indigo-400
                                   hover:shadow-md transition-all duration-200"
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                                {card.icon}
                            </div>

                            {/* Text */}
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white
                                               group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SettingsIndex;
