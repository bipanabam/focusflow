import { getPasswordStrength } from "../utils/passwordStrength";

const PasswordStrength = ({ password }) => {
    if (!password) return null;

    const { label, color, score } = getPasswordStrength(password);

    return (
        <div className="mt-1">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded ${i <= score ? color : "bg-gray-300"
                            }`}
                    />
                ))}
            </div>
            <span className="text-xs text-gray-400">
                Password strength:{" "}
                <span className="font-medium">{label}</span>
            </span>
        </div>
    );
};

export default PasswordStrength;
