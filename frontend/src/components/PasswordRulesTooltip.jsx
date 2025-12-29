const rules = [
    { label: "At least 8 characters", test: (v) => v.length >= 8 },
    { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
    { label: "One number", test: (v) => /[0-9]/.test(v) },
    { label: "One special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const PasswordRulesTooltip = ({ password }) => {
    return (
        <div className="absolute z-10 bg-gray-900 text-white text-xs rounded-md p-3 shadow-lg w-64">
            <p className="font-medium mb-2">Password must contain:</p>
            <ul className="space-y-1">
                {rules.map((rule, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <span
                            className={`w-2 h-2 rounded-full ${rule.test(password) ? "bg-green-500" : "bg-gray-500"
                                }`}
                        />
                        {rule.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordRulesTooltip;
