import { NavLink, Outlet } from "react-router-dom";

const UserSettings = () => {
    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-4 border dark:border-gray-700">
                <nav className="space-y-2">
                    <NavLink
                        to="account"
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg ${isActive ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600"
                                : "text-gray-600 dark:text-gray-400"
                            }`
                        }
                    >
                        Account Settings
                    </NavLink>
                    <NavLink
                        to="pomodoro"
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg ${isActive ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600"
                                : "text-gray-600 dark:text-gray-400"
                            }`
                        }
                    >
                        Pomodoro Settings
                    </NavLink>
                </nav>
            </aside>

            {/* Content */}
            <main className="md:col-span-3">
                <Outlet />
            </main>
        </div>
    );
};

export default UserSettings;
