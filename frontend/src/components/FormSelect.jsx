import React from "react";

const FormSelect = ({ label, options = [], children, ...props }) => {
    return (
        <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-medium text-white">
                {label}
            </label>

            <select
                {...props}
                className="w-full h-9 px-3 rounded-md border border-gray-300 bg-gray-700 text-sm outline-none
                           focus:ring-2 focus:ring-blue-400"
            >
                <option value="" disabled className="">
                    Select {label}
                </option>

                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {children}
        </div>
    );
};

export default FormSelect;
