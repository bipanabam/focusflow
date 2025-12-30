import React from "react";
import { useState } from "react";

const FormInput = ({ label, multiline = false, rows = 3, className="", children, ...props }) => {
    const [show, setShow] = useState(false);
    const isPassword = props.type === "password";

    const baseClass =
        "w-full px-3 rounded-md border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-400";
    return (
        <div className="w-full flex flex-col gap-1 relative">
            <label className="text-sm font-medium text-white">
                {label}
            </label>

            <div className="relative">
                {multiline ? (
                    <textarea
                        {...props}
                        rows={rows}
                        className={`${baseClass} py-2 resize-none ${className}`}
                    />
                ) : (
                <input
                    {...props}
                    type={isPassword && show ? "text" : props.type}
                    className={`${baseClass} h-9 pr-10 ${className}`}
                />
                )}
                {isPassword && !multiline && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                    >
                        {show ? "Hide" : "Show"}
                    </button>
                )}

            </div>
            {children}
        </div>
    );
};

export default FormInput;
