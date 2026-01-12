import { NavLink } from "react-router-dom";

const Breadcrumbs = ({ items = [] }) => {
    return (
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex flex-wrap items-center gap-1">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                if (item.path && !isLast) {
                    return (
                        <span key={index} className="flex items-center gap-1">
                            <NavLink
                                to={item.path}
                                className="hover:underline text-gray-500 dark:text-gray-400"
                            >
                                {item.label}
                            </NavLink>
                            <span>/</span>
                        </span>
                    );
                }

                return (
                    <span
                        key={index}
                        className={`flex items-center gap-1 font-medium ${isLast ? "text-gray-900 dark:text-white" : ""}`}
                    >
                        {item.label} {isLast ? "" : "/"}
                    </span>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
