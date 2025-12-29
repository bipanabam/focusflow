import React from "react";
import { useState } from "react";

const FormInput = ({ label, children, ...props }) => {
    const [show, setShow] = useState(false);
    const isPassword = props.type === "password";
    return (
        <div className="w-full flex flex-col gap-1 relative">
            <label className="text-sm font-medium text-white">
                {label}
            </label>

            <div className="relative">
                <input
                    {...props}
                    type={isPassword && show ? "text" : props.type}   
                    className="w-full h-9 px-3 pr-10 rounded-md border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                {isPassword && (
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
